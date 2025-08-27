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
    .describe('Annual income in USD.'),
  deductions: z
    .number()
    .describe('Total deductions in USD.'),
  location: z
    .string()
    .describe('The location of the user. e.g. city, state'),
});
export type TaxEstimationInput = z.infer<typeof TaxEstimationInputSchema>;

const TaxEstimationOutputSchema = z.object({
  estimatedTax: z
    .number()
    .describe('Estimated total tax amount in USD.'),
  taxRate: z
    .number()
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
  prompt: `You are an expert tax estimator. Based on the user's income, deductions, and location, provide an estimate of their tax obligations.

Income: {{{income}}}
Deductions: {{{deductions}}}
Location: {{{location}}}

Provide a detailed breakdown of how the tax was estimated, including the tax rate.

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
    return output!;
  }
);
