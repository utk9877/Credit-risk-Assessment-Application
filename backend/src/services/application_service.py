from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..db import models
from ..schemas.risk_schemas import ApplicationCreate


def create_application(db: Session, payload: ApplicationCreate) -> models.Application:
    app = models.Application(
        applicant_name=payload.applicant_name,
        applicant_email=payload.applicant_email,
        requested_amount=payload.requested_amount,
        purpose=payload.purpose,
        created_at=datetime.utcnow(),
        # Credit report fields
        credit_score=payload.credit_score,
        credit_utilization=payload.credit_utilization,
        payment_history_percent=payload.payment_history_percent,
        derogatory_marks=payload.derogatory_marks,
        hard_inquiries=payload.hard_inquiries,
        total_accounts=payload.total_accounts,
        oldest_account_years=payload.oldest_account_years,
        # Income data fields
        annual_income=payload.annual_income,
        employment_length_months=payload.employment_length_months,
        debt_to_income=payload.debt_to_income,
        monthly_debt_payments=payload.monthly_debt_payments,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def get_application(db: Session, application_id: int) -> models.Application:
    return db.query(models.Application).filter(models.Application.id == application_id).first()


def list_applications(db: Session, limit: int = 50, offset: int = 0) -> List[models.Application]:
    return db.query(models.Application).order_by(models.Application.created_at.desc()).offset(offset).limit(limit).all()
