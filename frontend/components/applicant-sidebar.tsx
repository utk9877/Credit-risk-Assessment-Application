"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Application } from "@/lib/types"
import { User, Mail, Phone, Calendar, Briefcase, DollarSign } from "lucide-react"

interface ApplicantSidebarProps {
  application: Application
}

export function ApplicantSidebar({ application }: ApplicantSidebarProps) {
  const { applicant, income_data, credit_report } = application

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const infoSections = [
    {
      title: "CONTACT",
      items: [
        { icon: User, label: "Name", value: applicant.name },
        { icon: Mail, label: "Email", value: applicant.email },
        { icon: Phone, label: "Phone", value: applicant.phone },
        { icon: Calendar, label: "Applied", value: formatDate(applicant.created_at) },
      ],
    },
    {
      title: "EMPLOYMENT",
      items: [
        {
          icon: Briefcase,
          label: "Tenure",
          value: `${Math.floor(income_data.employment_length_months / 12)}y ${income_data.employment_length_months % 12}m`,
        },
        {
          icon: DollarSign,
          label: "Annual Income",
          value: formatCurrency(income_data.annual_income),
        },
        {
          icon: DollarSign,
          label: "Monthly Debt",
          value: formatCurrency(income_data.monthly_debt_payments),
        },
      ],
    },
    {
      title: "CREDIT PROFILE",
      items: [
        { label: "Payment History", value: `${(credit_report.payment_history_percent * 100).toFixed(0)}%` },
        { label: "Hard Inquiries", value: credit_report.hard_inquiries.toString() },
        { label: "Derogatory Marks", value: credit_report.derogatory_marks.toString() },
        { label: "Oldest Account", value: `${credit_report.oldest_account_years} years` },
      ],
    },
  ]

  return (
    <aside className="w-72 flex-shrink-0 border-r border-border bg-card overflow-y-auto">
      <div className="p-4 space-y-4">
        {infoSections.map((section) => (
          <Card key={section.title} className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 py-2">
              <CardTitle className="text-[10px] font-mono tracking-widest text-muted-foreground">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    {"icon" in item && item.icon && (
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
                        {item.label}
                      </div>
                      <div className="text-sm font-mono truncate">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </aside>
  )
}
