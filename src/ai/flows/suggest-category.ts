// This file uses server-side code.
'use server';

import { ai, piiMiddleware } from '@/ai/genkit';
import { z } from 'genkit';

import { classifyCategory } from '../train/category-model';

const SuggestCategoryInputSchema = z.object({
  description: z.string().describe('Description of the transaction'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  category: z.string().describe('Suggested category for the transaction'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: { schema: SuggestCategoryInputSchema },
  output: { schema: SuggestCategoryOutputSchema },
  use: [piiMiddleware],
  prompt: `You are a financial assistant. Suggest a spending category for the following transaction description suitable for personal budgeting (e.g., Food, Transport, Utilities, Salary, Other).

Description: {{description}}`,
});

const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('No output returned from suggestCategoryFlow');
    }
    return output;
  }
);

/**
 * Suggest a category for a transaction description. Attempts to use the local
 * classifier first, falling back to the AI model if no prediction is available.
 */
export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
  const local = classifyCategory(input.description);
  if (local) {
    return { category: local };
  }
  return await suggestCategoryFlow(input);
}
