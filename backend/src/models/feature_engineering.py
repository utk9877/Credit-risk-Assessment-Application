from typing import List
import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def derive_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add derived features computed from this app's application schema
    (requested_amount, annual_income, debt_to_income, credit_score, ...).

    Derived features added:
    - loan_to_income_ratio: requested loan amount relative to annual income
    - monthly_income: annual_income / 12, used as a normalizing base
    - accounts_per_year: total_accounts relative to credit history length
    """
    df = df.copy()

    monthly_income = df["annual_income"] / 12.0 if "annual_income" in df.columns else pd.Series(np.nan, index=df.index)
    df["monthly_income"] = monthly_income

    if "requested_amount" in df.columns and "annual_income" in df.columns:
        df["loan_to_income_ratio"] = df["requested_amount"] / df["annual_income"].replace(0, np.nan)
    else:
        df["loan_to_income_ratio"] = np.nan

    if "total_accounts" in df.columns and "oldest_account_years" in df.columns:
        df["accounts_per_year"] = df["total_accounts"] / df["oldest_account_years"].replace(0, np.nan)
    else:
        df["accounts_per_year"] = np.nan

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
        # Detect categorical vs numeric. Use is_numeric_dtype rather than `dtype == object`
        # since pandas 2.x+ can back string columns with a dedicated StringDtype (not `object`).
        self.categorical_cols = sorted([c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])])
        self.numeric_cols = [c for c in df.columns if c not in self.categorical_cols]

        # Fit encoder on categoricals
        if self.categorical_cols:
            try:
                self.encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
            except TypeError:
                # fallback for older versions
                self.encoder = OneHotEncoder(handle_unknown="ignore", sparse=False)
            self.encoder.fit(df[self.categorical_cols].fillna("__MISSING__").astype(str))
            cat_feature_names = list(self.encoder.get_feature_names_out(self.categorical_cols))
        else:
            cat_feature_names = []

        # Fit scaler on numeric columns
        if self.numeric_cols:
            self.scaler = StandardScaler()
            self.scaler.fit(df[self.numeric_cols].fillna(0))

        # Deterministic feature order: numeric cols (sorted by original order), then categorical one-hot features
        self.feature_names = list(self.numeric_cols) + cat_feature_names
        return self.feature_names

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        df = df.copy()
        if self.numeric_cols:
            X_num = self.scaler.transform(df[self.numeric_cols].fillna(0))
        else:
            X_num = np.empty((len(df), 0))

        if self.categorical_cols:
            X_cat = self.encoder.transform(df[self.categorical_cols].fillna("__MISSING__").astype(str))
        else:
            X_cat = np.empty((len(df), 0))

        X = np.hstack([X_num, X_cat]) if X_cat.size or X_num.size else np.empty((len(df), 0))
        return X
