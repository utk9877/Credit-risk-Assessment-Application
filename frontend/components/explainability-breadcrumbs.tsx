"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { AuditEvent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Cpu, User, Settings, CheckCircle2, AlertCircle, FileText, Database } from "lucide-react"

interface ExplainabilityBreadcrumbsProps {
  events: AuditEvent[]
  maxEvents?: number
}

const categoryIcons = {
  system: Settings,
  user: User,
  model: Cpu,
}

const actionIcons: Record<string, typeof CheckCircle2> = {
  "Application Received": FileText,
  "Credit Pull Initiated": Database,
  "Income Verified": CheckCircle2,
  "Risk Model Executed": Cpu,
  "Manual Review Triggered": AlertCircle,
  "Analyst Assigned": User,
}

export function ExplainabilityBreadcrumbs({ events, maxEvents = 6 }: ExplainabilityBreadcrumbsProps) {
  const displayEvents = events.slice(0, maxEvents)

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono tracking-widest text-muted-foreground">DECISION TIMELINE</CardTitle>
          <span className="text-[10px] font-mono text-muted-foreground">{events.length} EVENTS</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          {/* Events */}
          <div className="space-y-4">
            {displayEvents.map((event, index) => {
              const ActionIcon = actionIcons[event.action] || categoryIcons[event.category]
              const isLast = index === displayEvents.length - 1

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start gap-4 group"
                >
                  {/* Node */}
                  <div
                    className={cn(
                      "relative z-10 flex items-center justify-center w-8 h-8 border bg-background",
                      event.category === "model" && "border-foreground",
                      event.category === "user" && "border-foreground",
                      event.category === "system" && "border-border",
                    )}
                  >
                    <ActionIcon className="h-3.5 w-3.5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium">{event.action}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{formatTime(event.timestamp)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{event.details}</div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Actor: {event.actor}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* More indicator */}
          {events.length > maxEvents && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="relative flex items-center gap-4 mt-4 pt-2 border-t border-border"
            >
              <div className="w-8 flex justify-center">
                <div className="w-1.5 h-1.5 bg-muted-foreground" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                +{events.length - maxEvents} MORE EVENTS
              </span>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
