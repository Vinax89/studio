// This file uses server-side code.
'use server';

import { z } from 'genkit';
import { calculateStateTax } from '@/data/stateTaxRates';

export const TaxEstimationInputSchema = z.object({
  income: z
    .number()
    .nonnegative()
    .describe('Annual income in USD.'),
  deductions: z
    .number()
    .nonnegative()
    .describe('Total deductions in USD.'),
  state: z
    .string()
    .length(2)
    .describe('Two-letter state code.'),
  filingStatus: z.enum(['single', 'married_jointly', 'married_separately', 'head_of_household'])
    .describe("The user's tax filing status, which is a key part of the W-4."),
});
export type TaxEstimationInput = z.infer<typeof TaxEstimationInputSchema>;

export const TaxEstimationOutputSchema = z.object({
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

interface Bracket {
  rate: number; // decimal
  upTo: number | null;
}

const FEDERAL_BRACKETS: Record<TaxEstimationInput['filingStatus'], Bracket[]> = {
  single: [
    { rate: 0.10, upTo: 11600 },
    { rate: 0.12, upTo: 47150 },
    { rate: 0.22, upTo: 100525 },
    { rate: 0.24, upTo: 191950 },
    { rate: 0.32, upTo: 243725 },
    { rate: 0.35, upTo: 609350 },
    { rate: 0.37, upTo: null },
  ],
  married_jointly: [
    { rate: 0.10, upTo: 23200 },
    { rate: 0.12, upTo: 94300 },
    { rate: 0.22, upTo: 201050 },
    { rate: 0.24, upTo: 383900 },
    { rate: 0.32, upTo: 487450 },
    { rate: 0.35, upTo: 731200 },
    { rate: 0.37, upTo: null },
  ],
  married_separately: [
    { rate: 0.10, upTo: 11600 },
    { rate: 0.12, upTo: 47150 },
    { rate: 0.22, upTo: 100525 },
    { rate: 0.24, upTo: 191950 },
    { rate: 0.32, upTo: 243725 },
    { rate: 0.35, upTo: 365600 },
    { rate: 0.37, upTo: null },
  ],
  head_of_household: [
    { rate: 0.10, upTo: 16550 },
    { rate: 0.12, upTo: 63100 },
    { rate: 0.22, upTo: 100500 },
    { rate: 0.24, upTo: 191950 },
    { rate: 0.32, upTo: 243700 },
    { rate: 0.35, upTo: 609350 },
    { rate: 0.37, upTo: null },
  ],
};

function calculateFederalTax(taxableIncome: number, status: TaxEstimationInput['filingStatus']): number {
  const brackets = FEDERAL_BRACKETS[status];
  let tax = 0;
  let last = 0;
  for (const bracket of brackets) {
    const cap = bracket.upTo ?? taxableIncome;
    const amount = Math.max(Math.min(cap, taxableIncome) - last, 0);
    tax += amount * bracket.rate;
    last = cap;
    if (taxableIncome <= cap) break;
  }
  return tax;
}

export async function estimateTax(input: TaxEstimationInput): Promise<TaxEstimationOutput> {
  const parsed = TaxEstimationInputSchema.parse(input);
  const taxableIncome = Math.max(0, parsed.income - parsed.deductions);
  const federalTax = calculateFederalTax(taxableIncome, parsed.filingStatus);
  const stateTax = calculateStateTax(taxableIncome, parsed.state);
  const total = federalTax + stateTax;
  const rate = parsed.income > 0 ? (total / parsed.income) * 100 : 0;
  const breakdown = `Federal Tax: $${federalTax.toFixed(2)}\nState Tax (${parsed.state}): $${stateTax.toFixed(2)}`;
  return TaxEstimationOutputSchema.parse({
    estimatedTax: total,
    taxRate: rate,
    breakdown,
  });
}
