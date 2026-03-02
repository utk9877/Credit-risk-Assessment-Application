// Credit Risk MVP - Core Types

export interface Applicant {
  id: string
  name: string
  email: string
  phone: string
  ssn_last_four: string
  created_at: string
}

export interface CreditReport {
  credit_score: number
  credit_utilization: number
  payment_history_percent: number
  derogatory_marks: number
  hard_inquiries: number
  total_accounts: number
  oldest_account_years: number
}

export interface IncomeData {
  annual_income: number
  employment_length_months: number
  debt_to_income: number
  monthly_debt_payments: number
}

export interface LoanRequest {
  amount: number
  purpose: string
  term_months: number
}

export interface RiskAssessment {
  id: string
  applicant_id: string
  score: number // 0-1000
  probability_of_default: number // 0-1
  risk_tier: "low" | "medium" | "high" | "critical"
  confidence: number // 0-1
  recommended_action: "approve" | "review" | "decline"
  timestamp: string
}

export interface FeatureContribution {
  feature_name: string
  display_name: string
  value: number | string
  contribution: number // SHAP value
  direction: "positive" | "negative" | "neutral"
  importance_rank: number
}

export interface DataProvenance {
  field_name: string
  source: string
  timestamp: string
  confidence: number
  verification_status: "verified" | "unverified" | "stale"
  raw_value: string | number
  transformed_value: string | number
}

export interface AuditEvent {
  id: string
  timestamp: string
  action: string
  actor: string
  details: string
  category: "system" | "user" | "model"
}

export interface ScenarioInput {
  feature: string
  label: string
  min: number
  max: number
  step: number
  current: number
  modified: number
}

export interface Application {
  id: string
  applicant: Applicant
  credit_report: CreditReport
  income_data: IncomeData
  loan_request: LoanRequest
  risk_assessment: RiskAssessment
  feature_contributions: FeatureContribution[]
  data_provenance: DataProvenance[]
  audit_trail: AuditEvent[]
}
