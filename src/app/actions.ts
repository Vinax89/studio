'use server'

import type {
  SuggestDebtStrategyInput,
  SuggestDebtStrategyOutput,
} from '@/ai/flows'
import { isValidCategoryName } from '@/lib/categoryService'

export async function suggestCategoryAction(description: string): Promise<string> {
  const { suggestCategory } = await import('@/ai/flows')
  const { category } = await suggestCategory({ description })
  return isValidCategoryName(category) ? category : 'Misc'
}

export async function suggestDebtStrategyAction(
  input: SuggestDebtStrategyInput,
): Promise<SuggestDebtStrategyOutput> {
  const { suggestDebtStrategy } = await import('@/ai/flows')
  return suggestDebtStrategy(input)
}
