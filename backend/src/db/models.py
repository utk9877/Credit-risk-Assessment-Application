from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from .base import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    applicant_name = Column(String(255), nullable=False)
    applicant_email = Column(String(255), nullable=True)
    requested_amount = Column(Numeric(12, 2), nullable=False)
    purpose = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False)
    
    # Credit report fields
    credit_score = Column(Integer, nullable=True)
    credit_utilization = Column(Numeric(5, 4), nullable=True)  # 0.0 to 1.0
    payment_history_percent = Column(Numeric(5, 4), nullable=True)  # 0.0 to 1.0
    derogatory_marks = Column(Integer, nullable=True, default=0)
    hard_inquiries = Column(Integer, nullable=True, default=0)
    total_accounts = Column(Integer, nullable=True)
    oldest_account_years = Column(Numeric(5, 2), nullable=True)
    
    # Income data fields
    annual_income = Column(Numeric(12, 2), nullable=True)
    employment_length_months = Column(Integer, nullable=True)
    debt_to_income = Column(Numeric(5, 4), nullable=True)  # 0.0 to 1.0
    monthly_debt_payments = Column(Numeric(10, 2), nullable=True)

    risk_assessments = relationship("RiskAssessment", back_populates="application", cascade="all, delete-orphan")
    # store persisted SHAP explainability entries
    shap_explanations = relationship("ShapExplanation", back_populates="application", cascade="all, delete-orphan")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False, index=True)
    evaluator = Column(String(255), nullable=True)
    score = Column(Numeric(5, 2), nullable=True)  # Score produced by ML/service later
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)

    application = relationship("Application", back_populates="risk_assessments")


class ShapExplanation(Base):
    __tablename__ = "shap_explanations"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False, index=True)
    shap_json = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False)

    application = relationship("Application", back_populates="shap_explanations")
