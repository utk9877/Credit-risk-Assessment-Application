"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { FeatureContribution } from "@/lib/types"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ExplainabilityPanelProps {
  contributions: FeatureContribution[]
  baselineScore?: number
}

export function ExplainabilityPanel({ contributions, baselineScore = 650 }: ExplainabilityPanelProps) {
  // Sort by importance
  const sortedContributions = [...contributions].sort((a, b) => a.importance_rank - b.importance_rank)

  // Calculate max contribution for scaling
  const maxContribution = Math.max(...contributions.map((c) => Math.abs(c.contribution)))

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono tracking-widest text-muted-foreground">
            FEATURE CONTRIBUTIONS
          </CardTitle>
          <span className="text-[10px] font-mono text-muted-foreground">SHAP VALUES</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Waterfall Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
          <div className="text-xs font-mono text-muted-foreground">BASELINE: {baselineScore}</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-foreground opacity-30" />
              <span className="text-[10px] font-mono text-muted-foreground">INCREASES RISK</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border border-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground">DECREASES RISK</span>
            </div>
          </div>
        </div>

        {/* Feature Bars */}
        <div className="space-y-3">
          {sortedContributions.map((contribution, index) => {
            const barWidth = (Math.abs(contribution.contribution) / maxContribution) * 100
            const isPositive = contribution.direction === "positive"

            return (
              <motion.div
                key={contribution.feature_name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="flex items-center gap-4">
                  {/* Rank indicator */}
                  <div className="w-4 text-[10px] font-mono text-muted-foreground">#{contribution.importance_rank}</div>

                  {/* Feature name and value */}
                  <div className="w-40 flex-shrink-0">
                    <div className="text-xs font-mono truncate">{contribution.display_name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{contribution.value}</div>
                  </div>

                  {/* Bar chart */}
                  <div className="flex-1 flex items-center gap-2">
                    {/* Negative side (decreases risk - good) */}
                    <div className="flex-1 flex justify-end">
                      {!isPositive && (
                        <motion.div
                          className="h-6 border border-foreground flex items-center justify-end pr-2"
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                        >
                          <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                            {(contribution.contribution * -100).toFixed(0)}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Center line */}
                    <div className="w-px h-8 bg-border" />

                    {/* Positive side (increases risk - bad) */}
                    <div className="flex-1">
                      {isPositive && (
                        <motion.div
                          className="h-6 bg-foreground opacity-30 flex items-center pl-2"
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                        >
                          <span className="text-[10px] font-mono text-background opacity-0 group-hover:opacity-100 transition-opacity">
                            +{(contribution.contribution * 100).toFixed(0)}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Direction icon */}
                  <div className="w-5 flex justify-center">
                    {contribution.direction === "positive" ? (
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : contribution.direction === "negative" ? (
                      <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">NET IMPACT</span>
            <span>
              {contributions.reduce(
                (sum, c) => sum + (c.direction === "positive" ? c.contribution : -c.contribution),
                0,
              ) > 0
                ? "+"
                : ""}
              {(
                contributions.reduce(
                  (sum, c) => sum + (c.direction === "positive" ? c.contribution : -c.contribution),
                  0,
                ) * 100
              ).toFixed(0)}{" "}
              points
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
