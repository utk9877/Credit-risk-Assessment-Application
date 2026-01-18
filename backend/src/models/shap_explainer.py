from typing import Any, List, Dict, Optional
import numpy as np
import shap

# Cached explainer to avoid reinitialization per request
_EXPLAINER: Optional[shap.Explainer] = None
_MODEL_REF: Any = None
_FEATURE_NAMES: Optional[List[str]] = None


def init_explainer(model: Any, background_data: Optional[np.ndarray] = None, feature_names: Optional[List[str]] = None):
    """Initialize and cache a SHAP explainer for a trained model.

    Params:
    - model: trained model (XGBoost or similar)
    - background_data: optional numpy array used by some explainers for background
    - feature_names: list of feature names corresponding to input vector
    """
    global _EXPLAINER, _MODEL_REF, _FEATURE_NAMES
    if model is None:
        raise ValueError("model must be provided to init_explainer")
    if _MODEL_REF is model and _EXPLAINER is not None:
        return _EXPLAINER

    # Prefer TreeExplainer for tree models (fast)
    try:
        if background_data is not None:
            _EXPLAINER = shap.TreeExplainer(model, data=background_data)
        else:
            _EXPLAINER = shap.TreeExplainer(model)
    except Exception:
        # Fallback to general Explainer
        _EXPLAINER = shap.Explainer(model, background_data)

    _MODEL_REF = model
    _FEATURE_NAMES = feature_names
    return _EXPLAINER


def explain_vector(X_vector: np.ndarray) -> np.ndarray:
    """Return raw SHAP values for the provided preprocessed vector (1D or 2D numpy array)."""
    if _EXPLAINER is None:
        raise RuntimeError("SHAP explainer not initialized")
    arr = X_vector
    if arr.ndim == 1:
        arr = arr.reshape(1, -1)

    # Support older and newer SHAP APIs
    try:
        vals = _EXPLAINER.shap_values(arr)
        # shap_values may return list (multiclass) or array
        if isinstance(vals, list):
            # choose the explanation for positive class (if present)
            vals = vals[1] if len(vals) > 1 else vals[0]
    except Exception:
        exp = _EXPLAINER(arr)
        # exp.values may be (n_samples, n_features) or (n_samples, n_classes, n_features)
        vals = exp.values
        if vals.ndim == 3:
            # pick class 1 if exists
            vals = vals[:, 1, :] if vals.shape[1] > 1 else vals[:, 0, :]

    return np.array(vals)


def explain_payload(payload: dict, preprocessor, top_k: Optional[int] = None) -> List[Dict[str, float]]:
    """Explain a single frontend payload.

    Returns a list of {feature, impact} sorted by absolute impact descending. Uses cached explainer.
    """
    # Build vector using provided preprocessor; prefer accepting preprocessed numpy as well
    from ..utils.schema_adapter import build_feature_vector_from_payload

    X_vector = build_feature_vector_from_payload(payload, preprocessor)
    shap_vals = explain_vector(X_vector)  # shape (1, n_features)
    row = shap_vals[0]

    names = _FEATURE_NAMES if _FEATURE_NAMES is not None else getattr(preprocessor, "feature_names", None)
    if names is None:
        # fallback to generic indices
        names = [f"f{i}" for i in range(len(row))]

    feats = [
        {"feature": names[i], "impact": float(row[i])}
        for i in range(min(len(names), len(row)))
    ]

    # sort by absolute impact
    feats = sorted(feats, key=lambda x: abs(x["impact"]), reverse=True)
    if top_k is not None:
        feats = feats[:top_k]
    return feats

