'use server'

import { suggestCategory } from '@/ai/flows'

export async function suggestCategoryAction(description: string): Promise<string> {
  const res = await suggestCategory({ description })
  return res.category
}
