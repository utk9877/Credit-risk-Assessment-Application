from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from ...db.session import get_db
from ...schemas.risk_schemas import (
    RiskAssessmentCreate,
    RiskAssessmentRead,
    SimulationRequest,
    SimulationResponse,
    FeatureContribution,
)
from ...services.risk_service import (
    create_risk_assessment_with_score,
    get_risk_assessment,
    list_risks_for_application,
    cache_shap_for_application,
    get_cached_shap,
)
from ...models import credit_risk_model
from ...models import shap_explainer
from loguru import logger

router = APIRouter()


@router.post("/calculate", status_code=status.HTTP_201_CREATED)
def calculate_risk(payload: RiskAssessmentCreate, db: Session = Depends(get_db)):
    """Calculate risk for an existing application (by application_id), persist assessment, return the saved assessment."""
    # Validate application exists
    from ...services.application_service import get_application

    app = get_application(db, payload.application_id)
    if not app:
        logger.warning("Application not found for id %s", payload.application_id)
        raise HTTPException(status_code=404, detail="Application not found")

    # Build payload dict from application model for prediction
    app_dict = {
        k: getattr(app, k)
        for k in [
            "applicant_name",
            "applicant_email",
            "requested_amount",
            "purpose",
            "created_at",
        ]
        if hasattr(app, k)
    }

    try:
        pred = credit_risk_model.predict_from_payload(app_dict)
    except Exception as e:
        logger.error("Prediction failed for application %s: %s", payload.application_id, e)
        raise HTTPException(status_code=500, detail=str(e))

    # Persist assessment with probability score
    try:
        ra = create_risk_assessment_with_score(db, payload.application_id, payload.evaluator or "automated", payload.notes or "", pred["prob_default"])  # type: ignore[arg-type]
    except Exception as e:
        logger.error("Failed to persist risk assessment: %s", e)
        raise HTTPException(status_code=500, detail="Failed to persist assessment")

    # Compute SHAP explanation and persist it
    try:
        expl = shap_explainer.explain_payload(app_dict, credit_risk_model.PREPROCESSOR, top_k=20)
        # persist SHAP explanation to DB
        cache_shap_for_application(db, payload.application_id, expl)
    except Exception as e:
        # Do not fail the request for explainability errors
        logger.warning("SHAP explanation failed: %s", e)
        expl = None

    # attach score to response and return assessment + explainability
    ra.score = pred["prob_default"]
    confidence = pred.get("confidence", 0.8)
    
    # Format SHAP explanations if available
    formatted_expl = None
    if expl:
        formatted_expl = [
            {"feature": item.get("feature", ""), "impact": float(item.get("impact", 0))}
            for item in expl
        ]
    
    response = {
        "assessment": {
            "id": ra.id,
            "application_id": ra.application_id,
            "evaluator": ra.evaluator,
            "notes": ra.notes,
            "score": float(ra.score) if ra.score is not None else None,
            "created_at": ra.created_at,
            "confidence": float(confidence),
        },
        "explainability": formatted_expl,
    }
    return response


@router.post("/simulate", status_code=status.HTTP_200_OK)
def simulate(payload: SimulationRequest, db: Session = Depends(get_db)):
    """Run a simulation from an existing application and a scenario override. Does NOT persist results."""
    # #region agent log
    import json
    try:
        with open('/Users/utkarsh/Downloads/credit-risk-mvp/.cursor/debug.log', 'a') as f:
            f.write(json.dumps({"location":"risk_assessment.py:90","message":"simulate entry","data":{"application_id":payload.application_id,"has_scenario":bool(payload.scenario)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"E"}) + '\n')
    except: pass
    # #endregion
    from ...services.application_service import get_application

    app = get_application(db, payload.application_id)
    # #region agent log
    try:
        with open('/Users/utkarsh/Downloads/credit-risk-mvp/.cursor/debug.log', 'a') as f:
            f.write(json.dumps({"location":"risk_assessment.py:96","message":"After get_application in simulate","data":{"found":app is not None,"app_id":app.id if app else None},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"E"}) + '\n')
    except: pass
    # #endregion
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Build baseline payload from application and apply scenario overrides
    app_dict = {c.name: getattr(app, c.name) for c in app.__table__.columns if hasattr(app, c.name)}
    if payload.scenario:
        # overlay scenario keys
        app_dict.update(payload.scenario)

    try:
        pred = credit_risk_model.predict_from_payload(app_dict)
    except Exception as e:
        logger.error("Simulation prediction failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

    # Create a simulated RiskAssessmentRead-like dict (not persisted)
    now = datetime.utcnow()
    simulated = {
        "id": -1,
        "application_id": payload.application_id,
        "evaluator": "simulation",
        "notes": "simulated",
        "score": pred["prob_default"],
        "created_at": now,
    }

    # get SHAP explanation but do not cache (unless we want to)
    try:
        expl = shap_explainer.explain_payload(app_dict, credit_risk_model.PREPROCESSOR, top_k=20)
    except Exception as e:
        logger.warning("SHAP explanation failed for simulation: %s", e)
        expl = None

    resp = {
        "status": "OK",
        "message": None,
        "simulated_scores": [simulated],
        "explainability": expl,
    }
    return resp


@router.get("/{risk_id}", response_model=RiskAssessmentRead)
def get_risk(risk_id: int, db: Session = Depends(get_db)):
    risk = get_risk_assessment(db, risk_id)
    if not risk:
        raise HTTPException(status_code=404, detail="Risk assessment not found")
    return risk


@router.get("/application/{application_id}", response_model=List[RiskAssessmentRead])
def get_risks_by_application(application_id: int, db: Session = Depends(get_db)):
    risks = list_risks_for_application(db, application_id)
    # Try to get SHAP explanations and add confidence if available
    for risk in risks:
        shap_data = get_cached_shap(db, application_id)
        if shap_data:
            # Calculate confidence from score if available
            if risk.score is not None:
                prob = float(risk.score)
                confidence = 1.0 - 2.0 * abs(prob - 0.5)
                confidence = max(0.0, min(1.0, confidence))
                risk.confidence = confidence
    return risks


@router.get("/application/{application_id}/explainability")
def get_explainability_for_application(application_id: int, db: Session = Depends(get_db)):
    """Get SHAP explainability for an application."""
    shap_data = get_cached_shap(db, application_id)
    if not shap_data:
        return {"explainability": None}
    
    formatted_expl = [
        {"feature": item.get("feature", ""), "impact": float(item.get("impact", 0))}
        for item in shap_data
    ]
    return {"explainability": formatted_expl}
