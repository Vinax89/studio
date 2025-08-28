'use server'

import { suggestCategory } from '@/ai/flows'

export async function suggestCategoryAction(description: string): Promise<string> {
  return suggestCategory(description)
}
