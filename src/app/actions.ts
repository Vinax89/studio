'use server'

export async function suggestCategoryAction(description: string): Promise<string> {
  const { suggestCategory } = await import('@/ai/flows')
  const { category } = await suggestCategory({ description })
  return category
}
