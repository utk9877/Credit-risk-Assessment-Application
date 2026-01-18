"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"
import { RiskGlyph } from "./risk-glyph"
import type { ScenarioInput } from "@/lib/types"
import { RotateCcw, Play, ArrowRight, TrendingUp, TrendingDown } from "lucide-react"

interface ScenarioSandboxProps {
  currentScore: number
  currentConfidence: number
  currentRiskTier: "low" | "medium" | "high" | "critical"
  initialInputs: ScenarioInput[]
  onSimulate?: (inputs: ScenarioInput[]) => void
  externalSimulated?: {
    score: number
    confidence: number
    riskTier: "low" | "medium" | "high" | "critical"
  } | null
}

export function ScenarioSandbox({
  currentScore,
  currentConfidence,
  currentRiskTier,
  initialInputs,
  onSimulate,
  externalSimulated,
}: ScenarioSandboxProps) {
  const [inputs, setInputs] = useState<ScenarioInput[]>(initialInputs)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulatedResult, setSimulatedResult] = useState<{
    score: number
    confidence: number
    riskTier: "low" | "medium" | "high" | "critical"
  } | null>(null)

  // prefer external simulated result if provided by parent
  const displayedResult = typeof externalSimulated !== "undefined" && externalSimulated !== null ? externalSimulated : simulatedResult

  // Check if any values have been modified
  const hasModifications = useMemo(() => {
    return inputs.some((input) => input.current !== input.modified)
  }, [inputs])

  const handleSliderChange = (feature: string, value: number) => {
    setInputs((prev) => prev.map((input) => (input.feature === feature ? { ...input, modified: value } : input)))
    // Clear previous simulation when inputs change
    setSimulatedResult(null)
  }

  const handleReset = () => {
    setInputs((prev) => prev.map((input) => ({ ...input, modified: input.current })))
    setSimulatedResult(null)
  }

  const handleSimulate = async () => {
    setIsSimulating(true)

    // Notify parent; parent may call backend and provide external simulated result.
    if (onSimulate) {
      try {
        onSimulate(inputs)
      } catch (e) {
        console.error("onSimulate handler threw", e)
      }
    }

    // Fallback to local mock simulation if parent did not provide handler
    setIsSimulating(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    // Calculate mock simulated score based on changes (original logic)
    let scoreChange = 0
    inputs.forEach((input) => {
      const diff = input.modified - input.current
      const percentChange = diff / (input.max - input.min)

      switch (input.feature) {
        case "credit_score":
          scoreChange += percentChange * 200
          break
        case "debt_to_income":
          scoreChange -= percentChange * 150
          break
        case "credit_utilization":
          scoreChange -= percentChange * 100
          break
        case "employment_length":
          scoreChange += percentChange * 50
          break
        case "annual_income":
          scoreChange += percentChange * 80
          break
        default:
          scoreChange += percentChange * 30
      }
    })

    const newScore = Math.max(300, Math.min(1000, currentScore + Math.round(scoreChange)))
    let newTier: "low" | "medium" | "high" | "critical" = "medium"
    if (newScore >= 800) newTier = "low"
    else if (newScore >= 650) newTier = "medium"
    else if (newScore >= 500) newTier = "high"
    else newTier = "critical"

    setSimulatedResult({
      score: newScore,
      confidence: Math.max(0.6, currentConfidence - Math.abs(scoreChange) / 1000),
      riskTier: newTier,
    })

    setIsSimulating(false)
    onSimulate?.(inputs)
  }

  const formatValue = (input: ScenarioInput, value: number) => {
    switch (input.feature) {
      case "credit_score":
        return value.toString()
      case "debt_to_income":
      case "credit_utilization":
        return `${(value * 100).toFixed(0)}%`
      case "employment_length":
        return `${value} mo`
      case "annual_income":
        return `$${(value / 1000).toFixed(0)}k`
      default:
        return value.toString()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono tracking-widest text-muted-foreground">SCENARIO SANDBOX</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!hasModifications}
              className="h-7 text-xs font-mono"
            >
              <RotateCcw className="h-3 w-3 mr-1.5" />
              RESET
            </Button>
            <Button
              size="sm"
              onClick={handleSimulate}
              disabled={!hasModifications || isSimulating}
              className="h-7 text-xs font-mono"
            >
              <Play className="h-3 w-3 mr-1.5" />
              {isSimulating ? "SIMULATING..." : "SIMULATE"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-8">
          {/* Sliders */}
          <div className="space-y-5">
            <div className="text-[10px] font-mono text-muted-foreground tracking-widest mb-4">MODIFY FEATURES</div>
            {inputs.map((input) => {
              const isModified = input.current !== input.modified
              const diff = input.modified - input.current
              const isImprovement =
                input.feature === "debt_to_income" || input.feature === "credit_utilization" ? diff < 0 : diff > 0

              return (
                <div key={input.feature} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono">{input.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {formatValue(input, input.current)}
                      </span>
                      {isModified && (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-1"
                        >
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] font-mono font-medium">
                            {formatValue(input, input.modified)}
                          </span>
                          {isImprovement ? (
                            <TrendingUp className="h-3 w-3 text-foreground" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-muted-foreground" />
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Slider
                      value={[input.modified]}
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      onValueChange={([value]) => handleSliderChange(input.feature, value)}
                      className="cursor-pointer"
                    />
                    {/* Original value marker */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-muted-foreground pointer-events-none"
                      style={{
                        left: `${((input.current - input.min) / (input.max - input.min)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Divider */}
          <div className="w-px bg-border" />

          {/* Results comparison */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-8">
              {/* Current */}
              <div className="text-center">
                <div className="text-[10px] font-mono text-muted-foreground tracking-widest mb-3">CURRENT</div>
                <RiskGlyph
                  score={currentScore}
                  confidence={currentConfidence}
                  riskTier={currentRiskTier}
                  size="sm"
                  showLabel={false}
                  animate={false}
                />
              </div>

              {/* Arrow */}
              <motion.div animate={{ opacity: hasModifications ? 1 : 0.3 }} className="flex items-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </motion.div>

              {/* Simulated */}
              <div className="text-center">
                <div className="text-[10px] font-mono text-muted-foreground tracking-widest mb-3">SIMULATED</div>
                <AnimatePresence mode="wait">
                  {simulatedResult ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <RiskGlyph
                        score={simulatedResult.score}
                        confidence={simulatedResult.confidence}
                        riskTier={simulatedResult.riskTier}
                        size="sm"
                        showLabel={false}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-20 h-20 border border-dashed border-border flex items-center justify-center"
                    >
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {hasModifications ? "RUN SIM" : "MODIFY"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Score delta */}
            <AnimatePresence>
              {simulatedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 pt-4 border-t border-border text-center"
                >
                  <div className="text-[10px] font-mono text-muted-foreground tracking-widest mb-1">SCORE CHANGE</div>
                  <div className="text-xl font-mono font-medium">
                    {simulatedResult.score >= currentScore ? "+" : ""}
                    {simulatedResult.score - currentScore}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
