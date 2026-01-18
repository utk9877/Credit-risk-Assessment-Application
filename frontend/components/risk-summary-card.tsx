"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiskGlyph } from "./risk-glyph"
import type { RiskAssessment, CreditReport, IncomeData } from "@/lib/types"
import { motion } from "framer-motion"

interface RiskSummaryCardProps {
  riskAssessment: RiskAssessment
  creditReport: CreditReport
  incomeData: IncomeData
}

export function RiskSummaryCard({ riskAssessment, creditReport, incomeData }: RiskSummaryCardProps) {
  const metrics = [
    {
      label: "PROBABILITY OF DEFAULT",
      value: `${(riskAssessment.probability_of_default * 100).toFixed(1)}%`,
      subtext: "within 24 months",
    },
    {
      label: "CREDIT SCORE",
      value: creditReport.credit_score.toString(),
      subtext: "Equifax",
    },
    {
      label: "DTI RATIO",
      value: `${(incomeData.debt_to_income * 100).toFixed(0)}%`,
      subtext: `$${incomeData.monthly_debt_payments.toLocaleString()}/mo`,
    },
    {
      label: "UTILIZATION",
      value: `${(creditReport.credit_utilization * 100).toFixed(0)}%`,
      subtext: `${creditReport.total_accounts} accounts`,
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono tracking-widest text-muted-foreground">RISK ASSESSMENT</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-8">
          {/* Main Risk Glyph */}
          <div className="flex-shrink-0">
            <RiskGlyph
              score={riskAssessment.score}
              confidence={riskAssessment.confidence}
              riskTier={riskAssessment.risk_tier}
              size="lg"
            />
          </div>

          {/* Metrics Grid */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="space-y-1"
              >
                <div className="text-[10px] font-mono tracking-widest text-muted-foreground">{metric.label}</div>
                <div className="text-2xl font-mono font-medium">{metric.value}</div>
                <div className="text-xs text-muted-foreground font-mono">{metric.subtext}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommendation Bar */}
        <motion.div
          className="mt-6 pt-4 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono tracking-widest text-muted-foreground">MODEL RECOMMENDATION</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-medium uppercase">{riskAssessment.recommended_action}</span>
              <div className="h-2 w-2 bg-foreground" />
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
