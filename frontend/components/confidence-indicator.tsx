"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ConfidenceIndicatorProps {
  confidence: number // 0-1
  label?: string
  showPercentage?: boolean
  variant?: "inline" | "expanded"
}

export function ConfidenceIndicator({
  confidence,
  label = "Model Confidence",
  showPercentage = true,
  variant = "inline",
}: ConfidenceIndicatorProps) {
  const percentage = Math.round(confidence * 100)

  const getConfidenceLevel = (conf: number) => {
    if (conf >= 0.9) return { label: "HIGH", class: "bg-foreground" }
    if (conf >= 0.75) return { label: "MODERATE", class: "bg-foreground opacity-70" }
    if (conf >= 0.6) return { label: "LOW", class: "bg-foreground opacity-50" }
    return { label: "UNCERTAIN", class: "bg-destructive" }
  }

  const level = getConfidenceLevel(confidence)

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-2">
          {/* Confidence bar */}
          <div className="w-24 h-1.5 bg-muted overflow-hidden">
            <motion.div
              className={cn("h-full", level.class)}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          {showPercentage && <span className="text-xs font-mono">{percentage}%</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{level.label}</span>
      </div>
      <div className="relative">
        {/* Background track */}
        <div className="w-full h-2 bg-muted" />

        {/* Confidence fill */}
        <motion.div
          className={cn("absolute top-0 left-0 h-2", level.class)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Tick marks */}
        <div className="absolute top-0 left-0 right-0 h-2 flex">
          {[25, 50, 75].map((tick) => (
            <div key={tick} className="absolute h-full w-px bg-background" style={{ left: `${tick}%` }} />
          ))}
        </div>
      </div>
      {showPercentage && (
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>0%</span>
          <span className="font-medium text-foreground">{percentage}%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  )
}
