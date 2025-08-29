/**
 * Central exports for AI flows and their associated types.
 *
 * Consumers should import flows from this module rather than individual files:
 *
 * ```ts
 * import { analyzeReceipt, estimateTax } from '@/ai/flows';
 * ```
 */

// Exports in this module are grouped with their associated types and
// kept in alphabetical order for easier maintenance.

export {
  analyzeReceipt,
  type AnalyzeReceiptInput,
  type AnalyzeReceiptOutput,
} from './analyze-receipt';

export {
  analyzeSpendingHabits,
  type AnalyzeSpendingHabitsInput,
  type AnalyzeSpendingHabitsOutput,
} from './analyze-spending-habits';

export {
  calculateCashflow,
  type CalculateCashflowInput,
  type CalculateCashflowOutput,
} from './calculate-cashflow';

export {
  estimateTax,
  type TaxEstimationInput,
  type TaxEstimationOutput,
} from './tax-estimation';

export {
  predictSpending,
  type SpendingForecastInput,
  type SpendingForecastOutput,
} from './spendingForecast';

export { suggestCategory } from './categorize-transaction';

export {
  suggestDebtStrategy,
  type SuggestDebtStrategyInput,
  type SuggestDebtStrategyOutput,
} from './suggest-debt-strategy';
