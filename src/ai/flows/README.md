# AI Flows

Central exports for all AI-powered flows. Import flows and their input/output types from the index:

```ts
import {
  analyzeReceipt,
  type AnalyzeReceiptInput,
  type AnalyzeReceiptOutput,
  estimateTax,
  type TaxEstimationInput,
  type TaxEstimationOutput,
  analyzeSpendingHabits,
  type AnalyzeSpendingHabitsInput,
  type AnalyzeSpendingHabitsOutput,
  suggestDebtStrategy,
  type SuggestDebtStrategyInput,
  type SuggestDebtStrategyOutput,
  calculateCashflow,
  type CalculateCashflowInput,
  type CalculateCashflowOutput,
  predictSpending,
  type SpendingForecastInput,
  type SpendingForecastOutput,
} from "@/ai/flows";
```

## Available flows

- `analyzeReceipt` – analyze receipt images and extract transaction details.
- `estimateTax` – estimate annual tax obligations.
- `analyzeSpendingHabits` – evaluate spending patterns and opportunities.
- `suggestDebtStrategy` – recommend an optimal debt payoff plan.
- `calculateCashflow` – compute gross and net monthly cashflow.
- `predictSpending` – forecast future spending.
