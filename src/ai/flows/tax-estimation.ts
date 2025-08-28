// This file uses server-side code.
'use server';

/**
 * @fileOverview Provides a tax estimation based on user's income, state, and filing status.
 *
 * - estimateTax - A function that estimates tax obligations.
 * - TaxEstimationInput - The input type for the estimateTax function.
 * - TaxEstimationOutput - The return type for the estimateTax function.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import { calculateFederalTax } from '@/lib/tax/federal';
import { calculateStateTax } from '@/lib/tax/state';

const TaxEstimationInputSchema = z.object({
  income: z.number().nonnegative().describe('Annual income in USD.'),
  filingStatus: z
    .enum(['single', 'married_jointly', 'married_separately', 'head_of_household'])
    .describe("The user's tax filing status."),
  state: z
    .string()
    .length(2)
    .regex(/[A-Z]{2}/)
    .describe('Two-letter state code.'),
  localRate: z
    .number()
    .nonnegative()
    .max(100)
    .optional()
    .describe('Local tax rate as a percentage.'),
});
export type TaxEstimationInput = z.infer<typeof TaxEstimationInputSchema>;

const TaxEstimationOutputSchema = z.object({
  federalTax: z.number().nonnegative(),
  stateTax: z.number().nonnegative(),
  localTax: z.number().nonnegative(),
  estimatedTax: z.number().nonnegative(),
  taxRate: z.number().nonnegative().max(100),
  breakdown: z.string().describe('A detailed breakdown of the tax estimation.'),
});
export type TaxEstimationOutput = z.infer<typeof TaxEstimationOutputSchema>;

const breakdownPrompt = ai.definePrompt({
  name: 'taxBreakdownPrompt',
  input: {
    schema: z.object({
      federal: z.number(),
      state: z.number(),
      local: z.number(),
      total: z.number(),
      stateCode: z.string(),
    }),
  },
  output: { schema: z.object({ text: z.string() }) },
  prompt: `Provide a short narrative summary of the following tax calculation for a user.
Federal tax: {{federal}}
State tax ({{stateCode}}): {{state}}
Local tax: {{local}}
Total tax: {{total}}
Return only the narrative summary as plain text.`,
});

export async function estimateTax(
  input: TaxEstimationInput,
): Promise<TaxEstimationOutput> {
  const parsed = TaxEstimationInputSchema.parse(input);
  const federalTax = calculateFederalTax(parsed.income, parsed.filingStatus);
  const stateTax = calculateStateTax(
    parsed.income,
    parsed.state,
    parsed.filingStatus,
  );
  const localTax = parsed.localRate
    ? (parsed.income * parsed.localRate) / 100
    : 0;
  const total = federalTax + stateTax + localTax;
  const taxRate = parsed.income === 0 ? 0 : (total / parsed.income) * 100;

  const fallback = `Federal tax: $${federalTax.toFixed(2)}\nState tax (${parsed.state}): $${stateTax.toFixed(2)}\nLocal tax: $${localTax.toFixed(2)}`;
  let breakdown = fallback;
  try {
    const { output } = await breakdownPrompt({
      federal: federalTax,
      state: stateTax,
      local: localTax,
      total,
      stateCode: parsed.state,
    });
    if (output?.text) {
      breakdown = output.text;
    }
  } catch {
    // ignore AI errors and use fallback
  }

  return TaxEstimationOutputSchema.parse({
    federalTax,
    stateTax,
    localTax,
    estimatedTax: total,
    taxRate,
    breakdown,
  });
}
