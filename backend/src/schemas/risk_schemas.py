from typing import Optional, List
from pydantic import BaseModel, Field, condecimal
from datetime import datetime


class ApplicationBase(BaseModel):
    applicant_name: str = Field(..., example="John Doe")
    applicant_email: Optional[str] = Field(None, example="john@example.com")
    requested_amount: condecimal(max_digits=12, decimal_places=2) = Field(..., example=10000.00)
    purpose: Optional[str] = Field(None, example="Home improvement")
    
    # Credit report fields (optional)
    credit_score: Optional[int] = Field(None, example=700, ge=300, le=850)
    credit_utilization: Optional[condecimal(max_digits=5, decimal_places=4)] = Field(None, example=0.30, ge=0, le=1)
    payment_history_percent: Optional[condecimal(max_digits=5, decimal_places=4)] = Field(None, example=0.95, ge=0, le=1)
    derogatory_marks: Optional[int] = Field(None, example=0, ge=0)
    hard_inquiries: Optional[int] = Field(None, example=0, ge=0)
    total_accounts: Optional[int] = Field(None, example=5, ge=0)
    oldest_account_years: Optional[condecimal(max_digits=5, decimal_places=2)] = Field(None, example=3.0, ge=0)
    
    # Income data fields (optional)
    annual_income: Optional[condecimal(max_digits=12, decimal_places=2)] = Field(None, example=75000.00, ge=0)
    employment_length_months: Optional[int] = Field(None, example=24, ge=0)
    debt_to_income: Optional[condecimal(max_digits=5, decimal_places=4)] = Field(None, example=0.25, ge=0, le=1)
    monthly_debt_payments: Optional[condecimal(max_digits=10, decimal_places=2)] = Field(None, example=1000.00, ge=0)


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationRead(ApplicationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RiskAssessmentBase(BaseModel):
    application_id: int
    evaluator: Optional[str] = Field(None, example="automated-v1")
    notes: Optional[str] = None


class RiskAssessmentCreate(RiskAssessmentBase):
    # Score intentionally omitted from create (produced by ML/service)
    pass


class RiskAssessmentRead(RiskAssessmentBase):
    id: int
    score: Optional[condecimal(max_digits=5, decimal_places=2)] = None
    created_at: datetime
    confidence: Optional[float] = None  # Add confidence field

    class Config:
        from_attributes = True


class FeatureContribution(BaseModel):
    feature: str
    impact: float


class RiskAssessmentWithExplainability(BaseModel):
    assessment: RiskAssessmentRead
    explainability: Optional[List[FeatureContribution]] = None


class SimulationRequest(BaseModel):
    application_id: int
    scenario: Optional[dict] = Field(default_factory=dict)


class SimulationResponse(BaseModel):
    status: str
    message: Optional[str] = None
    simulated_scores: Optional[List[RiskAssessmentRead]] = None

    class Config:
        from_attributes = True
