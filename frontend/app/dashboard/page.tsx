import { MainNav } from "@/components/main-nav"
import { StatsCard } from "@/components/stats-card"
import { ApplicationsTable } from "@/components/applications-table"
import api from "@/lib/api"
import { notFound } from "next/navigation"
import type { Application } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  let applications: Application[] = []
  try {
    applications = await api.getApplications()
  } catch (err) {
    console.error("Failed to load applications", err)
    // Render a notFound or empty state; keep UI intact and show empty list
    applications = []
  }

  const totalApplications = applications.length
  const pendingReview = applications.filter((a) => a.risk_assessment.recommended_action === "review").length
  const approved = applications.filter((a) => a.risk_assessment.recommended_action === "approve").length
  const declined = applications.filter((a) => a.risk_assessment.recommended_action === "decline").length
  const avgScore = totalApplications > 0 ? Math.round(applications.reduce((sum, a) => sum + a.risk_assessment.score, 0) / totalApplications) : 0

  const riskDistribution = {
    low: applications.filter((a) => a.risk_assessment.risk_tier === "low").length,
    medium: applications.filter((a) => a.risk_assessment.risk_tier === "medium").length,
    high: applications.filter((a) => a.risk_assessment.risk_tier === "high").length,
    critical: applications.filter((a) => a.risk_assessment.risk_tier === "critical").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-mono font-medium">Dashboard</h1>
              <p className="text-xs font-mono text-muted-foreground mt-1">Overview of credit risk assessments</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <StatsCard label="TOTAL APPLICATIONS" value={totalApplications} subValue="+12%" trend="up" />
            <StatsCard
              label="PENDING REVIEW"
              value={pendingReview}
              subValue={`${totalApplications > 0 ? Math.round((pendingReview / totalApplications) * 100) : 0}%`}
              trend="neutral"
            />
            <StatsCard
              label="APPROVED"
              value={approved}
              subValue={`${totalApplications > 0 ? Math.round((approved / totalApplications) * 100) : 0}%`}
              trend="up"
            />
            <StatsCard
              label="DECLINED"
              value={declined}
              subValue={`${totalApplications > 0 ? Math.round((declined / totalApplications) * 100) : 0}%`}
              trend="down"
            />
            <StatsCard label="AVG RISK SCORE" value={avgScore} subValue="/1000" trend="neutral" />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-mono tracking-widest text-muted-foreground">
                  RISK DISTRIBUTION
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-16">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-green-500/20 border border-green-500"
                      style={{ height: `${totalApplications > 0 ? (riskDistribution.low / totalApplications) * 100 : 0}%`, minHeight: 4 }}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground">LOW</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-yellow-500/20 border border-yellow-500"
                      style={{ height: `${totalApplications > 0 ? (riskDistribution.medium / totalApplications) * 100 : 0}%`, minHeight: 4 }}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground">MED</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-orange-500/20 border border-orange-500"
                      style={{ height: `${totalApplications > 0 ? (riskDistribution.high / totalApplications) * 100 : 0}%`, minHeight: 4 }}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground">HIGH</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-red-500/20 border border-red-500"
                      style={{ height: `${totalApplications > 0 ? (riskDistribution.critical / totalApplications) * 100 : 0}%`, minHeight: 4 }}
                    />
                    <span className="text-[10px] font-mono text-muted-foreground">CRIT</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-mono tracking-widest text-muted-foreground">
                  RECENT ACTIVITY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 border ${
                            app.risk_assessment.risk_tier === "low"
                              ? "border-green-500 bg-green-500"
                              : app.risk_assessment.risk_tier === "medium"
                                ? "border-yellow-500 bg-yellow-500"
                                : app.risk_assessment.risk_tier === "high"
                                  ? "border-orange-500 bg-orange-500"
                                  : "border-red-500 bg-red-500"
                          }`}
                        />
                        <span>{app.applicant.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{app.loan_request.purpose}</span>
                        <span className="tabular-nums">${(app.loan_request.amount / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationsTable applications={applications} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
