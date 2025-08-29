'use server'

import { suggestCategory } from '@/ai/flows'

export async function suggestCategoryAction(description: string): Promise<string> {
  const { category } = await suggestCategory({ description })
  return category
}
