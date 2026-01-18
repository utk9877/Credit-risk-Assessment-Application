"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface RiskGlyphProps {
  score: number // 0-1000
  confidence: number // 0-1
  riskTier: "low" | "medium" | "high" | "critical"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  animate?: boolean
}

const tierConfig = {
  low: {
    color: "var(--foreground)",
    bgOpacity: 0.1,
    label: "LOW RISK",
  },
  medium: {
    color: "var(--foreground)",
    bgOpacity: 0.2,
    label: "MEDIUM RISK",
  },
  high: {
    color: "var(--foreground)",
    bgOpacity: 0.3,
    label: "HIGH RISK",
  },
  critical: {
    color: "var(--destructive)",
    bgOpacity: 0.4,
    label: "CRITICAL",
  },
}

const sizeConfig = {
  sm: { diameter: 80, strokeWidth: 3, fontSize: 14 },
  md: { diameter: 140, strokeWidth: 4, fontSize: 24 },
  lg: { diameter: 200, strokeWidth: 5, fontSize: 36 },
}

export function RiskGlyph({
  score,
  confidence,
  riskTier,
  size = "md",
  showLabel = true,
  animate = true,
}: RiskGlyphProps) {
  const config = tierConfig[riskTier] || tierConfig.medium
  const validSize: "sm" | "md" | "lg" = (size === "sm" || size === "md" || size === "lg") ? size : "md"
  const sizeConf = sizeConfig[validSize]
  const radius = (sizeConf.diameter - sizeConf.strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const scorePercent = score / 1000
  const strokeDashoffset = circumference * (1 - scorePercent)
  const confidenceRadius = radius - 12
  const confidenceCircumference = 2 * Math.PI * confidenceRadius

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: sizeConf.diameter, height: sizeConf.diameter }}>
        {/* Confidence Halo - outer glow */}
        <motion.div
          className="absolute inset-0"
          initial={animate ? { opacity: 0, scale: 0.8 } : false}
          animate={{ opacity: confidence * 0.3, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
            filter: `blur(${sizeConf.diameter / 8}px)`,
          }}
        />

        <svg width={sizeConf.diameter} height={sizeConf.diameter} className="relative z-10">
          {/* Background circle */}
          <circle
            cx={sizeConf.diameter / 2}
            cy={sizeConf.diameter / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConf.strokeWidth}
            className="opacity-10"
          />

          {/* Score arc */}
          <motion.circle
            cx={sizeConf.diameter / 2}
            cy={sizeConf.diameter / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConf.strokeWidth}
            strokeLinecap="square"
            strokeDasharray={circumference}
            initial={animate ? { strokeDashoffset: circumference } : false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center",
            }}
          />

          {/* Confidence ring (inner) */}
          <circle
            cx={sizeConf.diameter / 2}
            cy={sizeConf.diameter / 2}
            r={confidenceRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray={`${confidenceCircumference * confidence} ${confidenceCircumference}`}
            className="opacity-30"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center",
            }}
          />

          {/* Score text */}
          <text
            x={sizeConf.diameter / 2}
            y={sizeConf.diameter / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-mono"
            style={{ fontSize: sizeConf.fontSize }}
          >
            {score}
          </text>
        </svg>

        {/* Corner indicators for risk tier */}
        {riskTier === "critical" && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-destructive"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
      </div>

      {showLabel && (
        <div className="text-center">
          <span
            className={cn(
              "text-xs font-mono tracking-widest",
              riskTier === "critical" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {config.label}
          </span>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{Math.round(confidence * 100)}% CONF</div>
        </div>
      )}
    </div>
  )
}
