import { Application } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001"

/* ------------------------ */
/* Shared response handler */
/* ------------------------ */
async function handleResp(resp: Response) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/333f7760-8154-44f5-8ffa-0d4897bdfe76',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:8',message:'handleResp entry',data:{status:resp.status,ok:resp.ok,statusText:resp.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  if (!resp.ok) {
    const text = await resp.text()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/333f7760-8154-44f5-8ffa-0d4897bdfe76',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:11',message:'Response error',data:{status:resp.status,statusText:resp.statusText,errorText:text},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    throw new Error(text || resp.statusText)
  }
  const json = await resp.json()
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/333f7760-8154-44f5-8ffa-0d4897bdfe76',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:14',message:'handleResp success',data:{hasData:!!json},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return json
}

/* ------------------------ */
/* Utilities (CRITICAL)    */
/* ------------------------ */
function assertValidId(id: unknown, fnName: string): asserts id is number {
  if (typeof id !== 'number' || !Number.isInteger(id) || isNaN(id) || !isFinite(id)) {
    throw new Error(`${fnName} called with invalid id: ${id} (type: ${typeof id})`)
  }
}

/* ------------------------ */
/* Applications             */
/* ------------------------ */
export async function getApplications(): Promise<Application[]> {
  console.log("getApplications -> calling", `${API_URL}/api/applications/`)
  const res = await fetch(`${API_URL}/api/applications/`)
  const apps = await handleResp(res)

  const enriched = await Promise.all(
    apps.map(async (a: any) => {
      let risk = null
      let explainability = null
      try {
        const r = await fetch(`${API_URL}/api/risk-assessments/application/${a.id}`)
        const risks = await handleResp(r)
        risk = Array.isArray(risks) && risks.length > 0 ? risks[0] : null
        
        // Fetch SHAP explainability if available
        try {
          const explRes = await fetch(`${API_URL}/api/risk-assessments/application/${a.id}/explainability`)
          const explData = await handleResp(explRes)
          explainability = explData.explainability || null
        } catch {
          explainability = null
        }
      } catch {
        risk = null
      }

      const prob = risk?.score ?? null
      const score = prob !== null ? Math.round((1 - Number(prob)) * 1000) : 0
      const tier =
        score >= 800 ? "low" : score >= 650 ? "medium" : score >= 500 ? "high" : "critical"

      // Convert SHAP explanations to feature contributions format
      const featureContributions = explainability
        ? explainability.map((item: any, idx: number) => ({
            feature_name: item.feature || `feature_${idx}`,
            display_name: (item.feature || `Feature ${idx}`).replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
            value: item.impact,
            contribution: item.impact,
            direction: item.impact >= 0 ? "positive" : "negative",
            importance_rank: idx + 1,
          }))
        : []

      return {
        id: String(a.id),
        applicant: {
          id: `app-${a.id}`,
          name: a.applicant_name || "Unknown",
          email: a.applicant_email || "",
          phone: "",
          ssn_last_four: "",
          created_at: a.created_at || new Date().toISOString(),
        },
        credit_report: {
          credit_score: a.credit_score ?? 700,
          credit_utilization: a.credit_utilization ? Number(a.credit_utilization) : 0.3,
          payment_history_percent: a.payment_history_percent ? Number(a.payment_history_percent) : 0.95,
          derogatory_marks: a.derogatory_marks ?? 0,
          hard_inquiries: a.hard_inquiries ?? 0,
          total_accounts: a.total_accounts ?? 5,
          oldest_account_years: a.oldest_account_years ? Number(a.oldest_account_years) : 3,
        },
        income_data: {
          annual_income: a.annual_income ? Number(a.annual_income) : Number(a.requested_amount || 50000),
          employment_length_months: a.employment_length_months ?? 24,
          debt_to_income: a.debt_to_income ? Number(a.debt_to_income) : 0.25,
          monthly_debt_payments: a.monthly_debt_payments ? Number(a.monthly_debt_payments) : 1000,
        },
        loan_request: {
          amount: Number(a.requested_amount || 0),
          purpose: a.purpose || "",
          term_months: 36,
        },
        risk_assessment: {
          id: risk ? `risk-${risk.id}` : `risk-${a.id}`,
          applicant_id: `app-${a.id}`,
          score,
          probability_of_default: prob ?? 0,
          risk_tier: tier as any,
          confidence: risk?.confidence ?? 0.8,
          recommended_action:
            risk && Number(risk.score) < 0.2 ? "review" : "approve",
          timestamp: risk?.created_at ?? new Date().toISOString(),
        },
        feature_contributions: featureContributions,
        data_provenance: [],
        audit_trail: [],
      } as Application
    })
  )

  return enriched
}

export async function getApplicationById(id: string | number): Promise<Application> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/333f7760-8154-44f5-8ffa-0d4897bdfe76',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:110',message:'getApplicationById entry',data:{id,idType:typeof id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Convert to number with proper validation
  let nid: number
  if (typeof id === 'number') {
    nid = id
  } else if (typeof id === 'string') {
    const parsed = parseInt(id, 10)
    if (isNaN(parsed) || parsed.toString() !== id.trim()) {
      throw new Error(`getApplicationById called with invalid id: "${id}" (must be a valid integer)`)
    }
    nid = parsed
  } else {
    throw new Error(`getApplicationById called with invalid id type: ${typeof id}`)
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/333f7760-8154-44f5-8ffa-0d4897bdfe76',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:125',message:'ID conversion result',data:{originalId:id,convertedId:nid,isNaN:isNaN(nid),isInteger:Number.isInteger(nid)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.log("getApplicationById - applicationId:", id)
  assertValidId(nid, "getApplicationById")

  const url = `${API_URL}/api/applications/${nid}`
  console.log("getApplicationById -> calling", url)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/333f7760-8154-44f5-8ffa-0d4897bdfe76',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:109',message:'Before fetch request',data:{url,apiUrl:API_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const res = await fetch(url)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/333f7760-8154-44f5-8ffa-0d4897bdfe76',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:111',message:'After fetch response',data:{status:res.status,statusText:res.statusText,ok:res.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const a = await handleResp(res)

  let risk = null
  try {
    const r = await fetch(`${API_URL}/api/risk-assessments/application/${a.id}`)
    const risks = await handleResp(r)
    risk = Array.isArray(risks) && risks.length > 0 ? risks[0] : null
  } catch {
    risk = null
  }

  const prob = risk?.score ?? null
  const score = prob !== null ? Math.round((1 - Number(prob)) * 1000) : 0
  const tier =
    score >= 800 ? "low" : score >= 650 ? "medium" : score >= 500 ? "high" : "critical"

  // Fetch SHAP explainability if available
  let explainability = null
  try {
    const explRes = await fetch(`${API_URL}/api/risk-assessments/application/${a.id}/explainability`)
    const explData = await handleResp(explRes)
    explainability = explData.explainability || null
  } catch {
    explainability = null
  }

  // Convert SHAP explanations to feature contributions format
  const featureContributions = explainability
    ? explainability.map((item: any, idx: number) => ({
        feature_name: item.feature || `feature_${idx}`,
        display_name: (item.feature || `Feature ${idx}`).replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: item.impact,
        contribution: item.impact,
        direction: item.impact >= 0 ? "positive" : "negative",
        importance_rank: idx + 1,
      }))
    : []

  return {
    id: String(a.id),
    applicant: {
      id: `app-${a.id}`,
      name: a.applicant_name || "Unknown",
      email: a.applicant_email || "",
      phone: "",
      ssn_last_four: "",
      created_at: a.created_at || new Date().toISOString(),
    },
    credit_report: {
      credit_score: a.credit_score ?? 700,
      credit_utilization: a.credit_utilization ? Number(a.credit_utilization) : 0.3,
      payment_history_percent: a.payment_history_percent ? Number(a.payment_history_percent) : 0.95,
      derogatory_marks: a.derogatory_marks ?? 0,
      hard_inquiries: a.hard_inquiries ?? 0,
      total_accounts: a.total_accounts ?? 5,
      oldest_account_years: a.oldest_account_years ? Number(a.oldest_account_years) : 3,
    },
    income_data: {
      annual_income: a.annual_income ? Number(a.annual_income) : Number(a.requested_amount || 50000),
      employment_length_months: a.employment_length_months ?? 24,
      debt_to_income: a.debt_to_income ? Number(a.debt_to_income) : 0.25,
      monthly_debt_payments: a.monthly_debt_payments ? Number(a.monthly_debt_payments) : 1000,
    },
    loan_request: {
      amount: Number(a.requested_amount || 0),
      purpose: a.purpose || "",
      term_months: 36,
    },
    risk_assessment: {
      id: risk ? `risk-${risk.id}` : `risk-${a.id}`,
      applicant_id: `app-${a.id}`,
      score,
      probability_of_default: prob ?? 0,
      risk_tier: tier as any,
      confidence: risk?.confidence ?? 0.8,
      recommended_action:
        risk && Number(risk.score) < 0.2 ? "review" : "approve",
      timestamp: risk?.created_at ?? new Date().toISOString(),
    },
    feature_contributions: featureContributions,
    data_provenance: [],
    audit_trail: [],
  } as Application
}

/* ------------------------ */
/* Create Application       */
/* ------------------------ */
export async function createApplication(payload: any) {
  const body = {
    applicant_name: `${payload.firstName || ""} ${payload.lastName || ""}`.trim(),
    applicant_email: payload.email,
    requested_amount: payload.loanAmount,
    purpose: payload.loanPurpose,
    // Credit report fields (if provided)
    credit_score: payload.creditScore,
    credit_utilization: payload.creditUtilization,
    payment_history_percent: payload.paymentHistoryPercent,
    derogatory_marks: payload.derogatoryMarks,
    hard_inquiries: payload.hardInquiries,
    total_accounts: payload.totalAccounts,
    oldest_account_years: payload.oldestAccountYears,
    // Income data fields (if provided)
    annual_income: payload.annualIncome,
    employment_length_months: payload.employmentLength,
    debt_to_income: payload.debtToIncome,
    monthly_debt_payments: payload.monthlyDebtPayments,
  }

  // Remove undefined/null values to keep payload clean
  Object.keys(body).forEach(key => {
    if (body[key as keyof typeof body] === undefined || body[key as keyof typeof body] === null) {
      delete body[key as keyof typeof body]
    }
  })

  console.log("createApplication -> POST", `${API_URL}/api/applications/`, body)
  try {
    const res = await fetch(`${API_URL}/api/applications/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    return await handleResp(res)
  } catch (err) {
    // Re-throw with more context for browser console
    console.error("createApplication failed", err)
    throw err
  }
}

/* ------------------------ */
/* Risk APIs                */
/* ------------------------ */
export async function calculateRisk(payload: {
  application_id: string | number
  evaluator?: string
  notes?: string
}) {
  const id = Number(payload.application_id)
  console.log("calculateRisk - applicationId:", id, "payload:", payload)
  assertValidId(id, "calculateRisk")

  try {
    const res = await fetch(`${API_URL}/api/risk-assessments/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, application_id: id }),
    })

    return await handleResp(res)
  } catch (err) {
    console.error("calculateRisk failed", err)
    throw err
  }
}

export async function simulateRisk(payload: {
  application_id: string | number
  scenario?: Record<string, any>
}) {
  const id = Number(payload.application_id)
  console.log("simulateRisk - applicationId:", id, "payload:", payload)
  assertValidId(id, "simulateRisk")

  try {
    const res = await fetch(`${API_URL}/api/risk-assessments/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, application_id: id }),
    })

    return await handleResp(res)
  } catch (err) {
    console.error("simulateRisk failed", err)
    throw err
  }
}

/* ------------------------ */
/* Default export           */
/* ------------------------ */
export default {
  getApplications,
  getApplicationById,
  createApplication,
  calculateRisk,
  simulateRisk,
}
