// This file uses server-side code.
'use server';

/**
 * @fileOverview Generates a spending forecast based on past transactions.
 *
 * - predictSpending - A function that predicts future spending.
 * - SpendingForecastInput - The input type for the predictSpending function.
 * - SpendingForecastOutput - The return type for the predictSpending function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe('ISO date of the transaction.'),
  amount: z.number().describe('Transaction amount in USD.'),
  category: z.string().describe('Category for the transaction.'),
  description: z.string().optional().describe('Optional description of the transaction.'),
});

export const SpendingForecastInputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('Historical transaction data to analyze.'),
});
export type SpendingForecastInput = z.infer<typeof SpendingForecastInputSchema>;

const ForecastPointSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .describe('Month for the forecasted spending (e.g., 2024-08).'),
  amount: z.number().describe('Predicted total spending for the month in USD.'),
});

export const SpendingForecastOutputSchema = z.object({
  forecast: z.array(ForecastPointSchema).describe('Predicted spending for upcoming months.'),
  analysis: z.string().describe('Brief analysis of expected spending trends.'),
});
export type SpendingForecastOutput = z.infer<typeof SpendingForecastOutputSchema>;

type SpendingForecastError = { error: string };

export async function predictSpending(
  input: SpendingForecastInput
): Promise<SpendingForecastOutput | SpendingForecastError> {
  try {
    return await spendingForecastFlow(input);
  } catch (err) {
    console.error('spendingForecastFlow failed:', err);
    return { error: 'Unable to generate spending forecast. Please try again later.' };
  }
}

const prompt = ai.definePrompt({
  name: 'spendingForecastPrompt',
  input: {schema: SpendingForecastInputSchema},
  output: {schema: SpendingForecastOutputSchema},
  prompt: `You are a financial analyst. Review the user's past transactions and predict the total spending for the next three months.

Transactions:
{{#each transactions}}
- Date: {{date}}, Amount: \${{amount}}, Category: {{category}}
{{/each}}

Return:
1. forecast: an array with three objects, each having 'month' and 'amount'.
2. analysis: a short summary of the predicted spending trend.`,
});

const spendingForecastFlow = ai.defineFlow(
  {
    name: 'spendingForecastFlow',
    inputSchema: SpendingForecastInputSchema,
    outputSchema: SpendingForecastOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('No output returned from spendingForecastPrompt');
      }
      return output;
    } catch (err) {
      console.error('spendingForecastFlow prompt error:', err);
      throw new Error('spendingForecastFlow prompt failed');
    }
  }
);
