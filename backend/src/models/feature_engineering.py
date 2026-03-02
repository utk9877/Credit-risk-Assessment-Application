from typing import List, Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def derive_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add derived features with sensible fallbacks depending on available columns.

    Derived features added:
    - loan_to_income_ratio
    - employment_stability_score
    - credit_history_bucket
    """
    df = df.copy()

    # loan_to_income_ratio: prefer explicit monthly_income; otherwise use duration as proxy
    if "monthly_income" in df.columns and "credit_amount" in df.columns:
        df["loan_to_income_ratio"] = df["credit_amount"] / (df["monthly_income"].replace(0, np.nan).fillna(1))
    elif "credit_amount" in df.columns and "duration" in df.columns:
        # duration is often months; use as very rough proxy to avoid div-by-zero
        df["loan_to_income_ratio"] = df["credit_amount"] / (df["duration"].replace(0, np.nan).fillna(1))
    else:
        # fallback to small constant
        df["loan_to_income_ratio"] = df.get("credit_amount", 0) / 1.0

    # employment_stability_score: try to use an employment-related column; otherwise derive from age/duration
    if "employment" in df.columns:
        # map common employment categories to a stability score
        mapping = {"unemployed": 0.0, "temporary": 0.3, "probation": 0.5, "permanent": 1.0}
        df["employment_stability_score"] = df["employment"].map(mapping).fillna(0.5)
    elif "age" in df.columns and "duration" in df.columns:
        # older and longer duration -> more stable (simple heuristic)
        df["employment_stability_score"] = (df["age"] / (df["duration"] + 1)).clip(0, 100) / 100.0
    else:
        df["employment_stability_score"] = 0.5

    # credit_history_bucket: attempt to bucket a history-like column
    if "credit_history" in df.columns:
        df["credit_history_bucket"] = df["credit_history"].astype(str)
    elif "checking_status" in df.columns:
        df["credit_history_bucket"] = df["checking_status"].astype(str)
    else:
        # bucket by credit amount quantiles if nothing else available
        if "credit_amount" in df.columns:
            df["credit_history_bucket"] = pd.qcut(df["credit_amount"].rank(method="first"), q=4, labels=["low", "med", "high", "very_high"])
        else:
            df["credit_history_bucket"] = "unknown"

    return df


class FeaturePreprocessor:
    """Simple preprocessor bundling OneHotEncoder for categoricals and StandardScaler for numerics.

    The class exposes fit and transform methods and keeps a deterministic feature order list after fit.
    """

    def __init__(self):
        self.categorical_cols: List[str] = []
        self.numeric_cols: List[str] = []
        self.encoder: OneHotEncoder = None
        self.scaler: StandardScaler = None
        self.feature_names: List[str] = []

    def fit(self, df: pd.DataFrame) -> List[str]:
        df = df.copy()
        # Detect categorical vs numeric
        self.categorical_cols = sorted([c for c in df.columns if df[c].dtype == object or df[c].dtype.name == "category"])
        # numeric: include bool/int/float
        self.numeric_cols = [c for c in df.columns if c not in self.categorical_cols]

        # Fit encoder on categoricals
        if self.categorical_cols:
            # use sparse_output for newer scikit-learn versions
            try:
                self.encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
            except TypeError:
                # fallback for older versions
                self.encoder = OneHotEncoder(handle_unknown="ignore", sparse=False)
            self.encoder.fit(df[self.categorical_cols].fillna("__MISSING__"))
            cat_feature_names = list(self.encoder.get_feature_names_out(self.categorical_cols))
        else:
            cat_feature_names = []

        # Fit scaler on numeric columns
        if self.numeric_cols:
            self.scaler = StandardScaler()
            self.scaler.fit(df[self.numeric_cols].fillna(0))

        # Deterministic feature order: numeric cols (sorted by original order), then derived numeric (if any), then categorical one-hot features
        self.feature_names = list(self.numeric_cols) + cat_feature_names
        return self.feature_names

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        df = df.copy()
        # Ensure same columns exist
        # Transform numeric
        if self.numeric_cols:
            X_num = self.scaler.transform(df[self.numeric_cols].fillna(0))
        else:
            X_num = np.empty((len(df), 0))

        # Transform categorical
        if self.categorical_cols:
            X_cat = self.encoder.transform(df[self.categorical_cols].fillna("__MISSING__"))
        else:
            X_cat = np.empty((len(df), 0))

        X = np.hstack([X_num, X_cat]) if X_cat.size or X_num.size else np.empty((len(df), 0))
        return X
