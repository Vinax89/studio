// This file uses server-side code.
'use server';

/**
 * @fileOverview Provides a tax estimation based on user's income, deductions, and location.
 *
 * - estimateTax - A function that estimates tax obligations.
 * - TaxEstimationInput - The input type for the estimateTax function.
 * - TaxEstimationOutput - The return type for the estimateTax function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaxEstimationInputSchema = z.object({
  income: z
    .number()
    .min(0)
    .describe('Annual income in USD.'),
  deductions: z
    .number()
    .min(0)
    .describe('Total deductions in USD.'),
  location: z
    .string()
    .describe('The location of the user. e.g. city, state'),
  filingStatus: z.enum(['single', 'married_jointly', 'married_separately', 'head_of_household'])
    .describe("The user's tax filing status, which is a key part of the W-4."),
});
export type TaxEstimationInput = z.infer<typeof TaxEstimationInputSchema>;

const TaxEstimationOutputSchema = z.object({
  estimatedTax: z
    .number()
    .min(0)
    .describe('Estimated total tax amount in USD.'),
  taxRate: z
    .number()
    .min(0)
    .max(100)
    .describe('Estimated effective tax rate as a percentage.'),
  breakdown: z
    .string()
    .describe('A detailed breakdown of the tax estimation.'),
});
export type TaxEstimationOutput = z.infer<typeof TaxEstimationOutputSchema>;

export async function estimateTax(input: TaxEstimationInput): Promise<TaxEstimationOutput> {
  return taxEstimationFlow(input);
}

const taxEstimationPrompt = ai.definePrompt({
  name: 'taxEstimationPrompt',
  input: {schema: TaxEstimationInputSchema},
  output: {schema: TaxEstimationOutputSchema},
  prompt: `You are an expert tax estimator. Your calculations must be based on the official **2025 U.S. federal tax brackets**.

Based on the user's income, filing status, deductions, and location, provide an estimate of their tax obligations.

Income: {{{income}}}
Deductions: {{{deductions}}}
Location: {{{location}}}
Filing Status: {{{filingStatus}}}

Provide a detailed breakdown of how the tax was estimated, explaining how the filing status affects the standard deduction and the applicable tax brackets.

Consider federal, state, and local taxes where applicable.

Output the estimated tax, the tax rate, and the breakdown.`,
});

const taxEstimationFlow = ai.defineFlow(
  {
    name: 'taxEstimationFlow',
    inputSchema: TaxEstimationInputSchema,
    outputSchema: TaxEstimationOutputSchema,
  },
  async input => {
    const {output} = await taxEstimationPrompt(input);
    if (!output) {
      throw new Error('No output returned from taxEstimationFlow');
    }
    return output;
  }
);
