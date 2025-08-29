/**
 * Central exports for AI flows and their associated types.
 *
 * Consumers should import flows from this module rather than individual files:
 *
 * ```ts
 * import { analyzeReceipt, estimateTax } from '@/ai/flows';
 * ```
 */

export { analyzeReceipt } from './analyze-receipt';
export type { AnalyzeReceiptInput, AnalyzeReceiptOutput } from './analyze-receipt';

export { estimateTax } from './tax-estimation';
export type { TaxEstimationInput, TaxEstimationOutput } from './tax-estimation';

export { analyzeSpendingHabits } from './analyze-spending-habits';
export type {
  AnalyzeSpendingHabitsInput,
  AnalyzeSpendingHabitsOutput,
} from './analyze-spending-habits';

export { suggestDebtStrategy } from './suggest-debt-strategy';
export type {
  SuggestDebtStrategyInput,
  SuggestDebtStrategyOutput,
} from './suggest-debt-strategy';

export { suggestCategory } from './suggest-category';
export type { SuggestCategoryInput, SuggestCategoryOutput } from './suggest-category';

export { calculateCashflow } from './calculate-cashflow';
export type { CalculateCashflowInput, CalculateCashflowOutput } from './calculate-cashflow';
export { calculateCostOfLiving } from './cost-of-living';
export type {
  CalculateCostOfLivingInput,
  CostOfLivingBreakdown,
} from './cost-of-living';

export { predictSpending } from './spendingForecast';
export type { SpendingForecastInput, SpendingForecastOutput } from './spendingForecast';

export { calculateCostOfLiving } from './cost-of-living';
export type {
  CalculateCostOfLivingInput,
  CostOfLivingBreakdown,
} from './cost-of-living';
