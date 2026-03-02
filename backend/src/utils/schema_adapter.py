from typing import Any, Dict
import numpy as np
import pandas as pd

from ..models.feature_engineering import derive_features


def model_to_dict(model: Any) -> dict:
    # A tiny helper to adapt SQLAlchemy models to dicts if needed by non-Pydantic layers
    return {c.name: getattr(model, c.name) for c in model.__table__.columns}


def build_feature_vector_from_payload(payload: Dict[str, Any], preprocessor) -> np.ndarray:
    """Convert a frontend application payload to a preprocessed numpy vector using the provided preprocessor.

    - payload: dict of application fields coming from frontend
    - preprocessor: an instance of FeaturePreprocessor that has been fit (loaded from joblib)

    Returns: numpy array (1D) ready to pass to model.predict_proba
    """
    # Build a single-row DataFrame from payload
    df = pd.DataFrame([payload])

    # Apply derived features used during training
    df = derive_features(df)

    # Ensure all expected columns exist (preprocessor.numeric_cols + categorical_cols)
    expected_columns = []
    if hasattr(preprocessor, "numeric_cols") and preprocessor.numeric_cols:
        expected_columns.extend(preprocessor.numeric_cols)
    if hasattr(preprocessor, "categorical_cols") and preprocessor.categorical_cols:
        expected_columns.extend(preprocessor.categorical_cols)

    for c in expected_columns:
        if c not in df.columns:
            df[c] = pd.NA

    # Transform using preprocessor
    X = preprocessor.transform(df)
    return X.reshape(-1) if X.ndim == 2 and X.shape[0] == 1 else X

