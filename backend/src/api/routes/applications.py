from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...schemas.risk_schemas import ApplicationCreate, ApplicationRead
from ...services.application_service import create_application, get_application, list_applications

router = APIRouter()


@router.post("/", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application_endpoint(
    payload: ApplicationCreate, db: Session = Depends(get_db)
):
    return create_application(db, payload)


@router.get("/", response_model=List[ApplicationRead])
def list_applications_endpoint(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    return list_applications(db, limit=limit, offset=offset)


@router.get("/{application_id}", response_model=ApplicationRead)
def get_application_endpoint(application_id: int, db: Session = Depends(get_db)):
    # #region agent log
    import json
    try:
        with open('/Users/utkarsh/Downloads/credit-risk-mvp/.cursor/debug.log', 'a') as f:
            f.write(json.dumps({"location":"applications.py:24","message":"get_application_endpoint entry","data":{"application_id":application_id,"type":str(type(application_id))},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"C"}) + '\n')
    except: pass
    # #endregion
    app = get_application(db, application_id)
    # #region agent log
    try:
        with open('/Users/utkarsh/Downloads/credit-risk-mvp/.cursor/debug.log', 'a') as f:
            f.write(json.dumps({"location":"applications.py:27","message":"After get_application","data":{"found":app is not None,"app_id":app.id if app else None},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"C"}) + '\n')
    except: pass
    # #endregion
    if not app:
        # #region agent log
        try:
            with open('/Users/utkarsh/Downloads/credit-risk-mvp/.cursor/debug.log', 'a') as f:
                f.write(json.dumps({"location":"applications.py:29","message":"Application not found","data":{"application_id":application_id},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"C"}) + '\n')
        except: pass
        # #endregion
        raise HTTPException(status_code=404, detail="Application not found")
    return app
