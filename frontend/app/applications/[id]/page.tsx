"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { ApplicantSidebar } from "@/components/applicant-sidebar"
import { RiskSummaryCard } from "@/components/risk-summary-card"
import { ExplainabilityPanel } from "@/components/explainability-panel"
import { ExplainabilityBreadcrumbs } from "@/components/explainability-breadcrumbs"
import { ConfidenceIndicator } from "@/components/confidence-indicator"
import { ScenarioSandbox } from "@/components/scenario-sandbox"
import { DataProvenanceInspector } from "@/components/data-provenance-inspector"
import { AuditTrailDrawer } from "@/components/audit-trail-drawer"
import { defaultScenarioInputs } from "@/lib/mock-data"
import api from "@/lib/api"
import type { Application } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, ChevronLeft, CheckCircle2, XCircle, Eye } from "lucide-react"

export default function ApplicationDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const pathname = usePathname()
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [simulatedFromApi, setSimulatedFromApi] = useState<{
    score: number
    confidence: number
    riskTier: "low" | "medium" | "high" | "critical"
  } | null>(null)

  // Handle params which might be a Promise in Next.js 16, or might be undefined initially
  useEffect(() => {
    const resolveParams = async () => {
      try {
        let id: string | undefined
        
        // Try to get ID from params
        if (params) {
          const resolvedParams = params instanceof Promise ? await params : params
          id = resolvedParams?.id
        }
        
        // Fallback: extract ID from URL pathname if params didn't work
        if (!id && pathname) {
          const match = pathname.match(/\/applications\/([^\/]+)/)
          if (match && match[1]) {
            id = match[1]
          }
        }
        
        if (!id || id === 'undefined' || id === 'null') {
          setError("Invalid application ID")
          setLoading(false)
          return
        }
        
        setApplicationId(String(id))
      } catch (err) {
        console.error("Error resolving params:", err)
        setError("Failed to load application ID")
        setLoading(false)
      }
    }
    resolveParams()
  }, [params, pathname])

  useEffect(() => {
    if (!applicationId) return

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/333f7760-8154-44f5-8ffa-0d4897bdfe76',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:45',message:'useEffect entry',data:{id:applicationId,idType:typeof applicationId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    let mounted = true
    setLoading(true)
    setError(null)
    api
      .getApplicationById(applicationId)
      .then((a) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/333f7760-8154-44f5-8ffa-0d4897bdfe76',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:52',message:'getApplicationById success',data:{hasApplication:!!a,applicationId:a?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (mounted) setApplication(a)
      })
      .catch((e) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/333f7760-8154-44f5-8ffa-0d4897bdfe76',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:57',message:'getApplicationById error',data:{error:String(e),errorType:typeof e},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.error(e)
        if (mounted) setError(String(e))
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [applicationId])

  if (loading) return <div className="p-6">Loading application...</div>
  if (error) return <div className="p-6">Failed to load application: {error}</div>
  if (!application) return <div className="p-6">Application not found</div>

  const handleApprove = () => {
    console.log("Approved:", application.id)
  }

  const handleDecline = () => {
    console.log("Declined:", application.id)
  }

  const handleRequestReview = () => {
    console.log("Review requested:", application.id)
  }

  const scenarioInputs = defaultScenarioInputs.map((input) => {
    const appValue = (() => {
      switch (input.feature) {
        case "credit_score":
          return application.credit_report.credit_score
        case "debt_to_income":
          return application.income_data.debt_to_income
        case "credit_utilization":
          return application.credit_report.credit_utilization
        case "employment_length":
          return application.income_data.employment_length_months
        case "annual_income":
          return application.income_data.annual_income
        default:
          return input.current
      }
    })()
    return { ...input, current: appValue, modified: appValue }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="font-mono text-xs">
              <Link href="/applications">
                <ChevronLeft className="h-3 w-3 mr-1" />
                BACK
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-mono font-medium">{application.applicant.name}</h1>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {application.id.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-0.5 text-xs text-muted-foreground font-mono">
                <span>{formatCurrency(application.loan_request.amount)}</span>
                <span className="opacity-50">|</span>
                <span>{application.loan_request.term_months}mo</span>
                <span className="opacity-50">|</span>
                <span>{application.loan_request.purpose}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AuditTrailDrawer events={application.audit_trail} />
            <div className="h-6 w-px bg-border mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestReview}
              className="font-mono text-xs bg-transparent"
            >
              <Eye className="h-3 w-3 mr-1.5" />
              REVIEW
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="font-mono text-xs text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
            >
              <XCircle className="h-3 w-3 mr-1.5" />
              DECLINE
            </Button>
            <Button size="sm" onClick={handleApprove} className="font-mono text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1.5" />
              APPROVE
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <ApplicantSidebar application={application} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <RiskSummaryCard
              riskAssessment={application.risk_assessment}
              creditReport={application.credit_report}
              incomeData={application.income_data}
            />

            <ScenarioSandbox
              currentScore={application.risk_assessment.score}
              currentConfidence={application.risk_assessment.confidence}
              currentRiskTier={application.risk_assessment.risk_tier}
              initialInputs={scenarioInputs}
              externalSimulated={simulatedFromApi}
              onSimulate={async (inputs) => {
                const scenario: Record<string, any> = {}
                inputs.forEach((i) => (scenario[i.feature] = i.modified))
                try {
                  // Convert application.id (string) to number safely
                  const appIdNum = parseInt(application.id, 10)
                  if (isNaN(appIdNum)) {
                    throw new Error(`Invalid application ID: ${application.id}`)
                  }
                  const res = await api.simulateRisk({ application_id: appIdNum, scenario })
                  if (res && res.simulated_scores && res.simulated_scores.length > 0) {
                    const s = res.simulated_scores[0]
                    const prob = s.score ?? 0
                    const score = Math.round((1 - Number(prob)) * 1000)
                    const tier = score >= 800 ? "low" : score >= 650 ? "medium" : score >= 500 ? "high" : "critical"
                    setSimulatedFromApi({ score, confidence: (s as any).confidence ?? 0.8, riskTier: tier })
                  }
                } catch (e) {
                  console.error("Simulation failed", e)
                }
              }}
            />

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono tracking-widest text-muted-foreground">
                    MODEL CONFIDENCE
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ConfidenceIndicator
                    confidence={application.risk_assessment.confidence}
                    label="Prediction Confidence"
                    variant="expanded"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-mono tracking-widest text-muted-foreground">
                      DATA SOURCES
                    </CardTitle>
                    <DataProvenanceInspector provenance={application.data_provenance} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {application.data_provenance.slice(0, 3).map((prov) => (
                      <div key={prov.field_name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-mono">
                            {prov.field_name
                              .split("_")
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(" ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">{prov.source}</span>
                          <div
                            className={`w-2 h-2 border ${prov.verification_status === "verified" ? "border-foreground bg-foreground" : "border-muted-foreground"}`}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 text-[10px] font-mono text-muted-foreground">
                      +{application.data_provenance.length - 3} more sources
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <ExplainabilityPanel contributions={application.feature_contributions} />

            <ExplainabilityBreadcrumbs events={application.audit_trail} />
          </div>
        </main>
      </div>
    </div>
  )
}
