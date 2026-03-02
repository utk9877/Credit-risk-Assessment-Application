import os
from typing import Tuple, Dict, Any
import json

import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, precision_score, recall_score

import xgboost as xgb

from .feature_engineering import derive_features, FeaturePreprocessor


def load_dataset(local_path: str = "data/raw/german_credit.csv") -> pd.DataFrame:
    """Load dataset from local path if available, otherwise try kagglehub download, then OpenML as fallback.

    The kagglehub downloader returns a path to downloaded dataset files; this function will pick the first CSV found
    in that path and use it as the dataset.
    """
    # If file already exists locally, use it **only if** it contains a target column
    if os.path.exists(local_path):
        df_local = pd.read_csv(local_path)
        cols_lower = [c.lower() for c in df_local.columns]
        candidate_targets = {"target", "class", "risk", "credit_risk", "y", "label"}
        if any(ct in cols_lower for ct in candidate_targets):
            return df_local
        else:
            print(f"Local dataset at {local_path} found but missing a target column; will attempt to fetch labeled dataset")

    # Attempt kagglehub download (user requested method)
    try:
        import kagglehub

        print("Attempting to download dataset via kagglehub: uciml/german-credit")
        kaggle_path = kagglehub.dataset_download("uciml/german-credit")
        print("Path to dataset files:", kaggle_path)
        # find first CSV in the returned path
        csv_files = [f for f in os.listdir(kaggle_path) if f.lower().endswith(".csv")]
        if csv_files:
            csv_path = os.path.join(kaggle_path, csv_files[0])
            df = pd.read_csv(csv_path)
            # Check whether this CSV contains a target column; if not, do not persist and fall back
            cols_lower = [c.lower() for c in df.columns]
            candidate_targets = {"target", "class", "risk", "credit_risk", "y", "label"}
            if any(ct in cols_lower for ct in candidate_targets):
                os.makedirs(os.path.dirname(local_path), exist_ok=True)
                df.to_csv(local_path, index=False)
                return df
            else:
                print("Downloaded CSV does not contain a target column; will try OpenML fallback")
        else:
            print("No CSV found in kagglehub download path; falling back to OpenML")
    except Exception as e:
        print(f"kagglehub download failed or not available: {e}; falling back to OpenML fetch")

    # Fallback: fetch from OpenML (credit-g)
    try:
        from sklearn.datasets import fetch_openml

        X, y = fetch_openml("credit-g", version=1, as_frame=True, return_X_y=True)
        df = X.copy()
        df["target"] = y
        # persist locally
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        df.to_csv(local_path, index=False)
        return df
    except Exception as e:
        raise RuntimeError(
            "Could not load dataset locally, kagglehub failed, and fetching from OpenML failed: %s. Please place dataset at: %s"
            % (e, local_path)
        )


def prepare_xy(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    df = df.copy()
    # If target column has different name, try common names
    if "target" not in df.columns:
        for candidate in ["class", "credit_risk", "risk", "y"]:
            if candidate in df.columns:
                df = df.rename(columns={candidate: "target"})
                break

    if "target" not in df.columns:
        raise RuntimeError("No target column found in dataset; expected 'target' or common alternatives")

    # Normalize target to 0/1 where 1 indicates bad credit (or positive class). We'll map strings to binary.
    y = df["target"].copy()
    if y.dtype == object:
        # map common labels
        y = y.map({"good": 0, "bad": 1, "positive": 1, "negative": 0, "1": 1, "0": 0}).fillna(y)
        # If still strings like '1'/'2' map numerically
        try:
            y = y.astype(int)
            # convert to binary 0/1 if labels are 1/2
            if set(y.unique()) == {1, 2}:
                y = (y == 2).astype(int)
        except Exception:
            # final fallback: label encode
            from sklearn.preprocessing import LabelEncoder

            le = LabelEncoder()
            y = le.fit_transform(y)
    else:
        # numeric
        if set(y.unique()) == {1, 2}:
            y = (y == 2).astype(int)

    X = df.drop(columns=["target"])
    return X, y


def train_and_save(
    output_dir: str = "models",
    local_data_path: str = "data/raw/german_credit.csv",
    n_splits: int = 5,
    random_state: int = 42,
) -> Dict[str, Any]:
    os.makedirs(output_dir, exist_ok=True)

    df = load_dataset(local_data_path)
    df = derive_features(df)
    X, y = prepare_xy(df)

    # Split train/test for final evaluation
    X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, test_size=0.2, random_state=random_state)

    # Fit preprocessor on training data
    pre = FeaturePreprocessor()
    pre.fit(X_train)
    X_train_trans = pre.transform(X_train)
    X_test_trans = pre.transform(X_test)

    # Cross-validation with XGBoost
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    roc_list = []
    prec_list = []
    rec_list = []

    for train_idx, val_idx in skf.split(X_train_trans, y_train):
        X_tr, X_val = X_train_trans[train_idx], X_train_trans[val_idx]
        y_tr, y_val = y_train.iloc[train_idx], y_train.iloc[val_idx]

        clf = xgb.XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=random_state)
        clf.fit(X_tr, y_tr)

        y_score = clf.predict_proba(X_val)[:, 1]
        y_pred = clf.predict(X_val)

        roc_list.append(roc_auc_score(y_val, y_score))
        prec_list.append(precision_score(y_val, y_pred, zero_division=0))
        rec_list.append(recall_score(y_val, y_pred, zero_division=0))

    cv_results = {
        "roc_auc_mean": float(np.mean(roc_list)),
        "precision_mean": float(np.mean(prec_list)),
        "recall_mean": float(np.mean(rec_list)),
    }

    # Train final model on full training set
    final_clf = xgb.XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=random_state)
    final_clf.fit(X_train_trans, y_train)

    # Evaluate on test set
    y_test_score = final_clf.predict_proba(X_test_trans)[:, 1]
    y_test_pred = final_clf.predict(X_test_trans)
    test_metrics = {
        "roc_auc": float(roc_auc_score(y_test, y_test_score)),
        "precision": float(precision_score(y_test, y_test_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_test_pred, zero_division=0)),
    }

    # Save artifacts: model, scaler/encoder via joblib, and deterministic feature names
    model_path = os.path.join(output_dir, "xgboost_model.pkl")
    joblib.dump(final_clf, model_path)

    preproc_path = os.path.join(output_dir, "preprocessor.pkl")
    joblib.dump(pre, preproc_path)

    feature_names = pre.feature_names
    feature_names_path = os.path.join(output_dir, "feature_names.json")
    with open(feature_names_path, "w") as fh:
        json.dump(feature_names, fh)

    return {
        "cv_results": cv_results,
        "test_metrics": test_metrics,
        "model_path": model_path,
        "preprocessor_path": preproc_path,
        "feature_names_path": feature_names_path,
    }


if __name__ == "__main__":
    print("Run train_and_save() to train the model and save artifacts.")


# ----------------------
# Inference integration
# ----------------------

from ..utils.schema_adapter import build_feature_vector_from_payload

# Try to load model artifacts at import time for fast inference
MODEL = None
PREPROCESSOR = None
FEATURE_NAMES = None
MODEL_VERSION = None


def _load_artifacts(base_dir: str = "models"):
    global MODEL, PREPROCESSOR, FEATURE_NAMES, MODEL_VERSION
    try:
        model_path = os.path.join(base_dir, "xgboost_model.pkl")
        preproc_path = os.path.join(base_dir, "preprocessor.pkl")
        feature_names_path = os.path.join(base_dir, "feature_names.json")

        if os.path.exists(model_path):
            MODEL = joblib.load(model_path)
        if os.path.exists(preproc_path):
            PREPROCESSOR = joblib.load(preproc_path)
        if os.path.exists(feature_names_path):
            with open(feature_names_path, "r") as fh:
                FEATURE_NAMES = json.load(fh)

        # model_version: try to read explicit version file, otherwise derive from model metadata / file mtime
        version_path = os.path.join(base_dir, "model_version.json")
        if os.path.exists(version_path):
            with open(version_path, "r") as fh:
                MODEL_VERSION = json.load(fh).get("version")
        else:
            if MODEL is not None and os.path.exists(model_path):
                mtime = os.path.getmtime(model_path)
                MODEL_VERSION = f"xgboost-{int(mtime)}"
            elif MODEL is not None:
                MODEL_VERSION = getattr(MODEL, "version", MODEL.__class__.__name__)
    except Exception:
        # artifacts may not exist during development; leave as None
        MODEL = PREPROCESSOR = FEATURE_NAMES = MODEL_VERSION = None

    # If SHAP is available, initialize explainer for fast reuse
    try:
        from . import shap_explainer

        if MODEL is not None and PREPROCESSOR is not None:
            # Create a small background using zeros or rely on SHAP defaults
            try:
                # If possible, create a small background sample from preprocessor internals
                background = None
            except Exception:
                background = None
            shap_explainer.init_explainer(MODEL, background_data=background, feature_names=FEATURE_NAMES or getattr(PREPROCESSOR, "feature_names", None))
    except Exception:
        # shap may not be installed; skip silently
        pass


# Initialize artifacts on import
_load_artifacts()


def get_model_version() -> str:
    return MODEL_VERSION or "unknown"


def _compute_risk_values(prob_default: float) -> Dict[str, Any]:
    # risk_score derived as provided
    risk_score = round((1.0 - float(prob_default)) * 1000)

    # tiers
    if risk_score >= 800:
        tier = "LOW"
    elif 650 <= risk_score <= 799:
        tier = "MEDIUM"
    elif 500 <= risk_score <= 649:
        tier = "HIGH"
    else:
        tier = "CRITICAL"

    # confidence: 1 - 2 * abs(prob_default - 0.5)
    confidence = 1.0 - 2.0 * abs(float(prob_default) - 0.5)
    # clamp to [0,1]
    confidence = max(0.0, min(1.0, confidence))

    return {"risk_score": risk_score, "tier": tier, "confidence": confidence}


def predict_proba_from_vector(X_vector) -> float:
    """Given a preprocessed feature vector (2D numpy array or 1D), return probability of default (class=1).

    Expects MODEL to be loaded.
    """
    if MODEL is None:
        raise RuntimeError("Model artifact not loaded")
    arr = X_vector
    if hasattr(arr, "ndim") and arr.ndim == 1:
        arr = arr.reshape(1, -1)
    elif isinstance(arr, list):
        import numpy as _np

        arr = _np.array(arr).reshape(1, -1)
    prob = MODEL.predict_proba(arr)[:, 1][0]
    return float(prob)


def predict_from_payload(payload: dict) -> Dict[str, Any]:
    """High-level prediction API: accepts frontend payload (dict), returns dict with probability, risk_score, tier, confidence, model_version."""
    if PREPROCESSOR is None:
        raise RuntimeError("Preprocessor not loaded; cannot vectorize payload")

    # build feature vector using shared adapter
    X_vector = build_feature_vector_from_payload(payload, PREPROCESSOR)
    prob_default = predict_proba_from_vector(X_vector)
    risk_info = _compute_risk_values(prob_default)
    return {
        "prob_default": prob_default,
        "risk_score": risk_info["risk_score"],
        "tier": risk_info["tier"],
        "confidence": risk_info["confidence"],
        "model_version": get_model_version(),
    }

