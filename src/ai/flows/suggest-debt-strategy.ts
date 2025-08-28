// This file uses server-side code.
'use server';

/**
 * @fileOverview Analyzes a user's debts and suggests a payoff strategy.
 *
 * - suggestDebtStrategy - A function that returns an AI-powered debt payoff plan.
 * - SuggestDebtStrategyInput - The input type for the suggestDebtStrategy function.
 * - SuggestDebtStrategyOutput - The return type for the suggestDebtStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { RecurrenceValues } from '@/lib/types';

const DebtSchema = z.object({
    id: z.string(),
    name: z.string(),
    initialAmount: z.number().nonnegative(),
    currentAmount: z.number().nonnegative(),
    interestRate: z.number().nonnegative().max(100),
    minimumPayment: z.number().nonnegative(),
    dueDate: z.string(),
    recurrence: z.enum(RecurrenceValues),
});

const SuggestDebtStrategyInputSchema = z.object({
  debts: z.array(DebtSchema).describe("The user's list of debts."),
});
export type SuggestDebtStrategyInput = z.infer<typeof SuggestDebtStrategyInputSchema>;

const SuggestDebtStrategyOutputSchema = z.object({
  recommendedStrategy: z.enum(['avalanche', 'snowball']).describe("The recommended strategy, either 'avalanche' or 'snowball'."),
  strategyReasoning: z.string().describe("The reasoning behind the recommended strategy."),
  payoffOrder: z.array(z.object({
      debtName: z.string(),
      priority: z.number().int().min(1),
  })).describe("The recommended order to pay off the debts, starting with priority 1."),
  summary: z.string().describe("A brief, encouraging summary of the plan."),
});
export type SuggestDebtStrategyOutput = z.infer<typeof SuggestDebtStrategyOutputSchema>;

export async function suggestDebtStrategy(input: SuggestDebtStrategyInput): Promise<SuggestDebtStrategyOutput> {
  return suggestDebtStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDebtStrategyPrompt',
  input: {schema: SuggestDebtStrategyInputSchema},
  output: {schema: SuggestDebtStrategyOutputSchema},
  prompt: `You are an expert financial advisor specializing in debt management for healthcare professionals like nurses. Analyze the following list of debts and recommend the best payoff strategy.

Your primary goal is to help the user save the most money on interest, so you should lean towards the 'avalanche' method (highest interest rate first) unless there is a very small debt that could be paid off quickly for a psychological win (the 'snowball' method).

Debts:
{{#each debts}}
- {{name}}: \${{currentAmount}} remaining at {{interestRate}}% APR. Min payment: \${{minimumPayment}}.
{{/each}}

Based on this, please provide:
1.  **recommendedStrategy**: The name of the strategy you recommend ('avalanche' or 'snowball').
2.  **strategyReasoning**: A clear, concise explanation of WHY you chose this strategy for this specific set of debts.
3.  **payoffOrder**: A list of the debts in the order they should be prioritized.
4.  **summary**: A brief, encouraging summary of the plan to motivate the user.`,
});

const suggestDebtStrategyFlow = ai.defineFlow(
  {
    name: 'suggestDebtStrategyFlow',
    inputSchema: SuggestDebtStrategyInputSchema,
    outputSchema: SuggestDebtStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No output returned from suggestDebtStrategyFlow');
    }
    return output;
  }
);
