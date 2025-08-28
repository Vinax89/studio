// This file uses server-side code.
'use server';

/**
 * @fileOverview Provides a cashflow analysis based on income, taxes, and deductions.
 *
 * - calculateCashflow - A function that estimates monthly gross and net cashflow.
 * - CalculateCashflowInput - The input type for the calculateCashflow function.
 * - CalculateCashflowOutput - The return type for the calculateCashflow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateCashflowInputSchema = z.object({
  annualIncome: z
    .number()
    .nonnegative()
    .describe('Total annual gross income from all sources.'),
  estimatedAnnualTaxes: z
    .number()
    .nonnegative()
    .describe('Estimated total annual taxes (federal, state, local).'),
  totalMonthlyDeductions: z
    .number()
    .nonnegative()
    .describe('Total of all monthly deductions and expenses (e.g., rent, loans, utilities, groceries).'),
});
export type CalculateCashflowInput = z.infer<typeof CalculateCashflowInputSchema>;

const CalculateCashflowOutputSchema = z.object({
  grossMonthlyIncome: z
    .number()
    .nonnegative()
    .describe('The gross monthly income, calculated as annual income divided by 12.'),
  netMonthlyIncome: z
    .number()
    .min(-1000000)
    .describe('The net monthly income, calculated as gross monthly income minus monthly taxes and deductions.'),
  analysis: z
    .string()
    .describe('A brief analysis and summary of the cashflow situation.'),
});
export type CalculateCashflowOutput = z.infer<typeof CalculateCashflowOutputSchema>;

type CalculateCashflowError = { error: string };

export async function calculateCashflow(
  input: CalculateCashflowInput
): Promise<CalculateCashflowOutput | CalculateCashflowError> {
  try {
    return await calculateCashflowFlow(input);
  } catch (err) {
    console.error('calculateCashflowFlow failed:', err);
    return { error: 'Unable to calculate cashflow. Please try again later.' };
  }
}

const prompt = ai.definePrompt({
  name: 'calculateCashflowPrompt',
  input: {schema: CalculateCashflowInputSchema},
  output: {schema: CalculateCashflowOutputSchema},
  prompt: `You are a financial analyst. Based on the user's provided income, taxes, and deductions, calculate their gross and net monthly cashflow.

Annual Income: {{{annualIncome}}}
Estimated Annual Taxes: {{{estimatedAnnualTaxes}}}
Total Monthly Deductions: {{{totalMonthlyDeductions}}}

1.  Calculate Gross Monthly Income: Divide the Annual Income by 12.
2.  Calculate Net Monthly Income: Start with Gross Monthly Income, then subtract the monthly tax amount (Annual Taxes / 12), and then subtract the Total Monthly Deductions.
3.  Provide a brief, one or two-sentence 'analysis' of the result, simply stating whether it's a surplus or a deficit and what that means for savings or debt.

Return the results in the specified output format.`,
});

const calculateCashflowFlow = ai.defineFlow(
  {
    name: 'calculateCashflowFlow',
    inputSchema: CalculateCashflowInputSchema,
    outputSchema: CalculateCashflowOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('No output returned from calculateCashflowFlow');
      }
      return output;
    } catch (err) {
      console.error('calculateCashflowFlow prompt error:', err);
      throw new Error('calculateCashflowFlow prompt failed');
    }
  }
);
