from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...schemas.risk_schemas import ApplicationCreate, ApplicationRead, ApplicationStatusUpdate
from ...services.application_service import create_application, get_application, list_applications, update_application_status

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
    app = get_application(db, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.patch("/{application_id}/status", response_model=ApplicationRead)
def update_application_status_endpoint(
    application_id: int, payload: ApplicationStatusUpdate, db: Session = Depends(get_db)
):
    app = update_application_status(db, application_id, payload.status)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app
