'use server'

import type {
  SuggestDebtStrategyInput,
  SuggestDebtStrategyOutput,
} from '@/ai/flows'

export async function suggestCategoryAction(description: string): Promise<string> {
  const { suggestCategory } = await import('@/ai/flows')
  const { category } = await suggestCategory({ description })
  return category
}

export async function suggestDebtStrategyAction(
  input: SuggestDebtStrategyInput,
): Promise<SuggestDebtStrategyOutput> {
  const { suggestDebtStrategy } = await import('@/ai/flows')
  return suggestDebtStrategy(input)
}
