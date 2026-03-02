"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { DataProvenance } from "@/lib/types"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProvenanceBadgeProps {
  provenance: DataProvenance
  onClick?: () => void
}

export function ProvenanceBadge({ provenance, onClick }: ProvenanceBadgeProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
  }

  const StatusIcon = {
    verified: CheckCircle2,
    unverified: Clock,
    stale: AlertCircle,
  }[provenance.verification_status]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            onClick={onClick}
            className={cn(
              "font-mono text-[9px] cursor-pointer transition-colors hover:bg-secondary",
              provenance.verification_status === "stale" && "border-destructive/50 text-destructive",
            )}
          >
            <StatusIcon className="h-2.5 w-2.5 mr-1" />
            {provenance.source.split(" ")[0]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="font-mono text-xs">
          <div className="space-y-1">
            <div>Source: {provenance.source}</div>
            <div>Confidence: {Math.round(provenance.confidence * 100)}%</div>
            <div>Updated: {formatTime(provenance.timestamp)}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
