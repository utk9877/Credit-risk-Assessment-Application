import type { ScenarioInput } from "./types"

export const defaultScenarioInputs: ScenarioInput[] = [
  {
    feature: "credit_score",
    label: "Credit Score",
    min: 300,
    max: 850,
    step: 10,
    current: 712,
    modified: 712,
  },
  {
    feature: "debt_to_income",
    label: "Debt-to-Income Ratio",
    min: 0,
    max: 0.6,
    step: 0.01,
    current: 0.28,
    modified: 0.28,
  },
  {
    feature: "credit_utilization",
    label: "Credit Utilization",
    min: 0,
    max: 1,
    step: 0.01,
    current: 0.34,
    modified: 0.34,
  },
  {
    feature: "employment_length",
    label: "Employment Length",
    min: 0,
    max: 120,
    step: 6,
    current: 36,
    modified: 36,
  },
  {
    feature: "annual_income",
    label: "Annual Income",
    min: 20000,
    max: 250000,
    step: 5000,
    current: 85000,
    modified: 85000,
  },
]
