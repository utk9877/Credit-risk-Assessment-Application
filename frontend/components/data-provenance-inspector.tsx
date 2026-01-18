"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import type { DataProvenance } from "@/lib/types"
import { Database, CheckCircle2, AlertCircle, Clock, ArrowRight, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataProvenanceInspectorProps {
  provenance: DataProvenance[]
  trigger?: React.ReactNode
}

const sourceIcons: Record<string, string> = {
  "Equifax API": "EQ",
  "TransUnion API": "TU",
  "Plaid Income": "PL",
  "Employer Verification": "EV",
  Calculated: "CA",
}

const verificationColors = {
  verified: "border-foreground",
  unverified: "border-muted-foreground",
  stale: "border-destructive",
}

export function DataProvenanceInspector({ provenance, trigger }: DataProvenanceInspectorProps) {
  const [selectedField, setSelectedField] = useState<DataProvenance | null>(null)
  const [open, setOpen] = useState(false)

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    }
  }

  const formatFieldName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="font-mono text-xs bg-transparent">
            <Database className="h-3 w-3 mr-1.5" />
            DATA PROVENANCE
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm font-mono tracking-widest">DATA PROVENANCE INSPECTOR</DialogTitle>
          <DialogDescription className="text-xs font-mono text-muted-foreground">
            View data sources, transformations, and verification status for each field.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden mt-4">
          {/* Field List */}
          <div className="w-64 border-r border-border pr-4 overflow-y-auto">
            <div className="text-[10px] font-mono tracking-widest text-muted-foreground mb-3">FIELDS</div>
            <div className="space-y-1">
              {provenance.map((field) => {
                const isSelected = selectedField?.field_name === field.field_name
                const { time } = formatTimestamp(field.timestamp)

                return (
                  <button
                    key={field.field_name}
                    onClick={() => setSelectedField(field)}
                    className={cn(
                      "w-full text-left px-3 py-2 border transition-colors",
                      isSelected ? "border-foreground bg-secondary" : "border-transparent hover:border-border",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono">{formatFieldName(field.field_name)}</span>
                      <div
                        className={cn("w-2 h-2 border", verificationColors[field.verification_status])}
                        title={field.verification_status}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-muted-foreground">{field.source}</span>
                      <span className="text-[10px] font-mono text-muted-foreground opacity-50">|</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{time}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Field Detail */}
          <div className="flex-1 pl-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {selectedField ? (
                <motion.div
                  key={selectedField.field_name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div>
                    <h3 className="text-lg font-mono font-medium">{formatFieldName(selectedField.field_name)}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-[10px]",
                          selectedField.verification_status === "verified" && "border-foreground",
                          selectedField.verification_status === "stale" && "border-destructive text-destructive",
                        )}
                      >
                        {selectedField.verification_status === "verified" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {selectedField.verification_status === "stale" && <AlertCircle className="h-3 w-3 mr-1" />}
                        {selectedField.verification_status.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {Math.round(selectedField.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>

                  {/* Data Flow */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono tracking-widest text-muted-foreground">DATA FLOW</div>
                    <div className="flex items-center gap-4">
                      {/* Source */}
                      <div className="flex-1 border border-border p-4">
                        <div className="text-[10px] font-mono text-muted-foreground mb-2">SOURCE</div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border border-foreground flex items-center justify-center">
                            <span className="text-xs font-mono font-medium">
                              {sourceIcons[selectedField.source] || "??"}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-mono">{selectedField.source}</div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {formatTimestamp(selectedField.timestamp).date}{" "}
                              {formatTimestamp(selectedField.timestamp).time}
                            </div>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                      {/* Transformation */}
                      <div className="flex-1 border border-dashed border-border p-4">
                        <div className="text-[10px] font-mono text-muted-foreground mb-2">TRANSFORMATION</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">Raw:</span>
                            <span className="text-sm font-mono">{String(selectedField.raw_value)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-mono text-muted-foreground">Processed:</span>
                            <span className="text-sm font-mono font-medium">
                              {String(selectedField.transformed_value)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Breakdown */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono tracking-widest text-muted-foreground">
                      CONFIDENCE FACTORS
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border border-border p-3">
                        <div className="text-[10px] font-mono text-muted-foreground mb-1">SOURCE RELIABILITY</div>
                        <div className="text-lg font-mono">{Math.round(selectedField.confidence * 100)}%</div>
                      </div>
                      <div className="border border-border p-3">
                        <div className="text-[10px] font-mono text-muted-foreground mb-1">DATA FRESHNESS</div>
                        <div className="text-lg font-mono flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {(() => {
                            const hours = Math.round(
                              (Date.now() - new Date(selectedField.timestamp).getTime()) / (1000 * 60 * 60),
                            )
                            return hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`
                          })()}
                        </div>
                      </div>
                      <div className="border border-border p-3">
                        <div className="text-[10px] font-mono text-muted-foreground mb-1">VERIFICATION</div>
                        <div className="text-lg font-mono uppercase">{selectedField.verification_status}</div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Info */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span>Last updated: {formatTimestamp(selectedField.timestamp).date}</span>
                      <span>Source ID: {selectedField.field_name.toUpperCase()}_001</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center">
                    <Search className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <div className="text-sm font-mono text-muted-foreground">Select a field to inspect</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
