// This file uses server-side code.
'use server';

/**
 * @fileOverview Provides a tax estimation based on user's income, deductions, and location.
 *
 * - estimateTax - A function that estimates tax obligations.
 * - TaxEstimationInput - The input type for the estimateTax function.
 * - TaxEstimationOutput - The return type for the estimateTax function.
 */

import {z} from 'genkit';
import {calculateTaxes} from '@/lib/taxes';

const TaxEstimationInputSchema = z.object({
  income: z
    .number()
    .nonnegative()
    .describe('Annual income in USD.'),
  deductions: z
    .number()
    .nonnegative()
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
    .nonnegative()
    .describe('Estimated total tax amount in USD.'),
  taxRate: z
    .number()
    .nonnegative()
    .max(100)
    .describe('Estimated effective tax rate as a percentage.'),
  breakdown: z
    .string()
    .describe('A detailed breakdown of the tax estimation.'),
});
export type TaxEstimationOutput = z.infer<typeof TaxEstimationOutputSchema>;

export async function estimateTax(input: TaxEstimationInput): Promise<TaxEstimationOutput> {
  const parsed = TaxEstimationInputSchema.parse(input);
  const {incomeTax, payrollTaxes, breakdown} = calculateTaxes(
    parsed.income,
    parsed.deductions,
    parsed.filingStatus
  );
  const totalTax = incomeTax + payrollTaxes.total;
  const taxRate = parsed.income === 0 ? 0 : (totalTax / parsed.income) * 100;
  return TaxEstimationOutputSchema.parse({
    estimatedTax: totalTax,
    taxRate,
    breakdown,
  });
}
