"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Application } from "@/lib/types"
import { RiskGlyph } from "./risk-glyph"
import { ThemeToggle } from "./theme-toggle"
import { AuditTrailDrawer } from "./audit-trail-drawer"
import { CheckCircle2, XCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react"

interface ApplicationHeaderProps {
  application: Application
  onApprove?: () => void
  onDecline?: () => void
  onRequestReview?: () => void
  onPrevious?: () => void
  onNext?: () => void
  currentIndex?: number
  totalCount?: number
}

export function ApplicationHeader({
  application,
  onApprove,
  onDecline,
  onRequestReview,
  onPrevious,
  onNext,
  currentIndex = 1,
  totalCount = 1,
}: ApplicationHeaderProps) {
  const { applicant, loan_request, risk_assessment, audit_trail } = application

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Navigation and Applicant Info */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onPrevious} disabled={currentIndex <= 1} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous application</span>
            </Button>
            <span className="text-xs font-mono text-muted-foreground min-w-[60px] text-center">
              {currentIndex} / {totalCount}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={currentIndex >= totalCount}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next application</span>
            </Button>
          </div>

          <div className="h-8 w-px bg-border" />

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-mono font-medium">{applicant.name}</h1>
              <Badge variant="outline" className="font-mono text-[10px]">
                {application.id.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground font-mono">
              <span>{formatCurrency(loan_request.amount)}</span>
              <span className="opacity-50">|</span>
              <span>{loan_request.term_months}mo</span>
              <span className="opacity-50">|</span>
              <span>{loan_request.purpose}</span>
            </div>
          </div>
        </div>

        {/* Center: Risk Glyph */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <RiskGlyph
            score={risk_assessment.score}
            confidence={risk_assessment.confidence}
            riskTier={risk_assessment.risk_tier}
            size="sm"
            showLabel={false}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuditTrailDrawer events={audit_trail} />
          <div className="h-6 w-px bg-border mx-1" />
          <Button variant="outline" size="sm" onClick={onRequestReview} className="font-mono text-xs bg-transparent">
            <Eye className="h-3 w-3 mr-1.5" />
            REVIEW
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDecline}
            className="font-mono text-xs text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
          >
            <XCircle className="h-3 w-3 mr-1.5" />
            DECLINE
          </Button>
          <Button size="sm" onClick={onApprove} className="font-mono text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1.5" />
            APPROVE
          </Button>
        </div>
      </div>
    </header>
  )
}
