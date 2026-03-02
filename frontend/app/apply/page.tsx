"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

const steps = [
  { id: 1, name: "Personal Info" },
  { id: 2, name: "Employment" },
  { id: 3, name: "Loan Details" },
  { id: 4, name: "Review" },
]

export default function ApplyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employerName: "",
    jobTitle: "",
    employmentLength: 24,
    annualIncome: 75000,
    loanAmount: 25000,
    loanPurpose: "",
    loanTerm: 36,
  })

  const updateFormData = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Call backend to create application
      await api.createApplication({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        loanAmount: formData.loanAmount,
        loanPurpose: formData.loanPurpose,
      })
      router.push("/applications")
    } catch (e) {
      console.error("Failed to submit application", e)
      // keep user on page; optionally show toast (not added)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl font-mono font-medium">New Application</h1>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Submit a new credit application for assessment
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 border flex items-center justify-center font-mono text-xs transition-colors",
                      currentStep > step.id
                        ? "border-foreground bg-foreground text-background"
                        : currentStep === step.id
                          ? "border-foreground"
                          : "border-muted-foreground text-muted-foreground",
                    )}
                  >
                    {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-mono mt-2",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn("h-px w-16 mx-2 -mt-6", currentStep > step.id ? "bg-foreground" : "bg-border")} />
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono">{steps[currentStep - 1].name}</CardTitle>
              <CardDescription className="text-xs font-mono">
                {currentStep === 1 && "Enter applicant contact information"}
                {currentStep === 2 && "Provide employment and income details"}
                {currentStep === 3 && "Specify loan requirements"}
                {currentStep === 4 && "Review and submit application"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs font-mono">
                        FIRST NAME
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData("firstName", e.target.value)}
                        className="font-mono text-sm"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs font-mono">
                        LAST NAME
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData("lastName", e.target.value)}
                        className="font-mono text-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-mono">
                      EMAIL
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="font-mono text-sm"
                      placeholder="john.doe@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-mono">
                      PHONE
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      className="font-mono text-sm"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="employerName" className="text-xs font-mono">
                      EMPLOYER NAME
                    </Label>
                    <Input
                      id="employerName"
                      value={formData.employerName}
                      onChange={(e) => updateFormData("employerName", e.target.value)}
                      className="font-mono text-sm"
                      placeholder="Acme Corporation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="text-xs font-mono">
                      JOB TITLE
                    </Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => updateFormData("jobTitle", e.target.value)}
                      className="font-mono text-sm"
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-mono">EMPLOYMENT LENGTH: {formData.employmentLength} months</Label>
                    <Slider
                      value={[formData.employmentLength]}
                      onValueChange={([value]) => updateFormData("employmentLength", value)}
                      min={0}
                      max={240}
                      step={6}
                      className="py-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-mono">ANNUAL INCOME: {formatCurrency(formData.annualIncome)}</Label>
                    <Slider
                      value={[formData.annualIncome]}
                      onValueChange={([value]) => updateFormData("annualIncome", value)}
                      min={20000}
                      max={500000}
                      step={5000}
                      className="py-4"
                    />
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-mono">LOAN AMOUNT: {formatCurrency(formData.loanAmount)}</Label>
                    <Slider
                      value={[formData.loanAmount]}
                      onValueChange={([value]) => updateFormData("loanAmount", value)}
                      min={5000}
                      max={100000}
                      step={1000}
                      className="py-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loanPurpose" className="text-xs font-mono">
                      LOAN PURPOSE
                    </Label>
                    <Select
                      value={formData.loanPurpose}
                      onValueChange={(value) => updateFormData("loanPurpose", value)}
                    >
                      <SelectTrigger className="font-mono text-sm">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debt_consolidation" className="font-mono text-sm">
                          Debt Consolidation
                        </SelectItem>
                        <SelectItem value="home_improvement" className="font-mono text-sm">
                          Home Improvement
                        </SelectItem>
                        <SelectItem value="vehicle_purchase" className="font-mono text-sm">
                          Vehicle Purchase
                        </SelectItem>
                        <SelectItem value="business_expansion" className="font-mono text-sm">
                          Business Expansion
                        </SelectItem>
                        <SelectItem value="medical_expenses" className="font-mono text-sm">
                          Medical Expenses
                        </SelectItem>
                        <SelectItem value="other" className="font-mono text-sm">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loanTerm" className="text-xs font-mono">
                      LOAN TERM
                    </Label>
                    <Select
                      value={formData.loanTerm.toString()}
                      onValueChange={(value) => updateFormData("loanTerm", Number.parseInt(value))}
                    >
                      <SelectTrigger className="font-mono text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12" className="font-mono text-sm">
                          12 months
                        </SelectItem>
                        <SelectItem value="24" className="font-mono text-sm">
                          24 months
                        </SelectItem>
                        <SelectItem value="36" className="font-mono text-sm">
                          36 months
                        </SelectItem>
                        <SelectItem value="48" className="font-mono text-sm">
                          48 months
                        </SelectItem>
                        <SelectItem value="60" className="font-mono text-sm">
                          60 months
                        </SelectItem>
                        <SelectItem value="84" className="font-mono text-sm">
                          84 months
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                    <div>
                      <span className="text-muted-foreground text-xs">NAME</span>
                      <p>
                        {formData.firstName} {formData.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">EMAIL</span>
                      <p>{formData.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">EMPLOYER</span>
                      <p>{formData.employerName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">ANNUAL INCOME</span>
                      <p>{formatCurrency(formData.annualIncome)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">LOAN AMOUNT</span>
                      <p>{formatCurrency(formData.loanAmount)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">TERM</span>
                      <p>{formData.loanTerm} months</p>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-mono text-muted-foreground">
                      By submitting this application, you authorize us to obtain credit reports and verify the
                      information provided.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="font-mono text-xs bg-transparent"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  BACK
                </Button>
                {currentStep < 4 ? (
                  <Button onClick={handleNext} className="font-mono text-xs">
                    NEXT
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="font-mono text-xs">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        SUBMITTING...
                      </>
                    ) : (
                      "SUBMIT APPLICATION"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
