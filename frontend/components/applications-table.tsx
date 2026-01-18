"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RiskGlyph } from "./risk-glyph"
import type { Application } from "@/lib/types"
import { Search, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApplicationsTableProps {
  applications: Application[]
}

type SortField = "name" | "score" | "amount" | "date"
type SortDirection = "asc" | "desc"

const riskTierColors = {
  low: "border-green-600 text-green-600 bg-green-50 dark:bg-green-950/30",
  medium: "border-yellow-600 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30",
  high: "border-orange-600 text-orange-600 bg-orange-50 dark:bg-orange-950/30",
  critical: "border-red-600 text-red-600 bg-red-50 dark:bg-red-950/30",
}

const actionColors = {
  approve: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  decline: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />
    return sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
  }

  const filteredApplications = applications.filter(
    (app) =>
      app.applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.loan_request.purpose.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const modifier = sortDirection === "asc" ? 1 : -1
    switch (sortField) {
      case "name":
        return a.applicant.name.localeCompare(b.applicant.name) * modifier
      case "score":
        return (a.risk_assessment.score - b.risk_assessment.score) * modifier
      case "amount":
        return (a.loan_request.amount - b.loan_request.amount) * modifier
      case "date":
        return (new Date(a.applicant.created_at).getTime() - new Date(b.applicant.created_at).getTime()) * modifier
      default:
        return 0
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 font-mono text-xs"
          />
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          {filteredApplications.length} of {applications.length} applications
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[60px] font-mono text-[10px] tracking-widest">RISK</TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("name")}
                  className="h-auto p-0 font-mono text-[10px] tracking-widest hover:bg-transparent"
                >
                  APPLICANT <SortIcon field="name" />
                </Button>
              </TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("amount")}
                  className="h-auto p-0 font-mono text-[10px] tracking-widest hover:bg-transparent"
                >
                  LOAN <SortIcon field="amount" />
                </Button>
              </TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("score")}
                  className="h-auto p-0 font-mono text-[10px] tracking-widest hover:bg-transparent"
                >
                  SCORE <SortIcon field="score" />
                </Button>
              </TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest">TIER</TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest">ACTION</TableHead>
              <TableHead className="font-mono text-[10px] tracking-widest">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("date")}
                  className="h-auto p-0 font-mono text-[10px] tracking-widest hover:bg-transparent"
                >
                  DATE <SortIcon field="date" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApplications.map((app) => (
              <TableRow key={app.id} className="group">
                <TableCell>
                  <RiskGlyph
                    score={app.risk_assessment.score}
                    confidence={app.risk_assessment.confidence}
                    riskTier={app.risk_assessment.risk_tier}
                    size="xs"
                    showLabel={false}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-mono text-sm font-medium">{app.applicant.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{app.id.toUpperCase()}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-mono text-sm">{formatCurrency(app.loan_request.amount)}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {app.loan_request.term_months}mo · {app.loan_request.purpose}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-mono text-lg font-medium">{app.risk_assessment.score}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("font-mono text-[10px]", riskTierColors[app.risk_assessment.risk_tier])}
                  >
                    {app.risk_assessment.risk_tier.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={cn("font-mono text-[10px]", actionColors[app.risk_assessment.recommended_action])}>
                    {app.risk_assessment.recommended_action.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {formatDate(app.applicant.created_at)}
                </TableCell>
                <TableCell>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Link href={`/applications/${app.id}`}>VIEW</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
