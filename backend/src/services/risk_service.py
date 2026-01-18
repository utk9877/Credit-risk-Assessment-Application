from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import json

from ..db import models
from ..schemas.risk_schemas import RiskAssessmentCreate
from sqlalchemy.orm import Session


def create_risk_assessment(db: Session, payload: RiskAssessmentCreate) -> models.RiskAssessment:
    ra = models.RiskAssessment(
        application_id=payload.application_id,
        evaluator=payload.evaluator,
        notes=payload.notes,
        created_at=datetime.utcnow(),
    )
    # Score will be populated by ML/service later; keep None for now
    db.add(ra)
    db.commit()
    db.refresh(ra)
    return ra


# In-memory cache for SHAP explanations per application id
_shap_cache = {}


def create_risk_assessment_with_score(db: Session, application_id: int, evaluator: str, notes: str, score: float) -> models.RiskAssessment:
    """Create and persist a risk assessment with provided score (probability of default).

    Returns the persisted RiskAssessment.
    """
    ra = models.RiskAssessment(
        application_id=application_id,
        evaluator=evaluator,
        notes=notes,
        score=score,
        created_at=datetime.utcnow(),
    )
    db.add(ra)
    db.commit()
    db.refresh(ra)
    return ra


def cache_shap_for_application(db: Session, application_id: int, shap_list: list) -> models.ShapExplanation:
    """Persist a SHAP explanation JSON for the given application.

    Returns the persisted ShapExplanation object.
    """
    # serialize the shap list to JSON
    shap_json = json.dumps(shap_list)
    se = models.ShapExplanation(
        application_id=int(application_id), shap_json=shap_json, created_at=datetime.utcnow()
    )
    db.add(se)
    db.commit()
    db.refresh(se)
    return se


def get_cached_shap(db: Session, application_id: int) -> Optional[list]:
    """Return the latest persisted SHAP explanation for an application, parsed as Python list.

    Returns None if no explanation exists.
    """
    se = (
        db.query(models.ShapExplanation)
        .filter(models.ShapExplanation.application_id == int(application_id))
        .order_by(models.ShapExplanation.created_at.desc())
        .first()
    )
    if not se:
        return None
    try:
        return json.loads(se.shap_json)
    except Exception:
        return None



def get_risk_assessment(db: Session, risk_id: int) -> models.RiskAssessment:
    return db.query(models.RiskAssessment).filter(models.RiskAssessment.id == risk_id).first()


def list_risks_for_application(db: Session, application_id: int) -> List[models.RiskAssessment]:
    return (
        db.query(models.RiskAssessment)
        .filter(models.RiskAssessment.application_id == application_id)
        .order_by(models.RiskAssessment.created_at.desc())
        .all()
    )


def simulate_scenario(db: Session, payload) -> None:
    # ML/simulation not implemented yet. Keep a clear contract.
    raise NotImplementedError("Simulation and ML scoring not implemented in scaffold")
