export type FilingStatus =
  | 'single'
  | 'married_jointly'
  | 'married_separately'
  | 'head_of_household';

const STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 15000,
  married_jointly: 30000,
  married_separately: 15000,
  head_of_household: 22500,
};

interface TaxBracket {
  rate: number;
  threshold: number;
}

const TAX_BRACKETS_2025: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.1, threshold: 11925 },
    { rate: 0.12, threshold: 48475 },
    { rate: 0.22, threshold: 103350 },
    { rate: 0.24, threshold: 197300 },
    { rate: 0.32, threshold: 250525 },
    { rate: 0.35, threshold: 626350 },
    { rate: 0.37, threshold: Infinity },
  ],
  married_jointly: [
    { rate: 0.1, threshold: 23850 },
    { rate: 0.12, threshold: 96950 },
    { rate: 0.22, threshold: 206700 },
    { rate: 0.24, threshold: 394600 },
    { rate: 0.32, threshold: 501050 },
    { rate: 0.35, threshold: 751600 },
    { rate: 0.37, threshold: Infinity },
  ],
  married_separately: [
    { rate: 0.1, threshold: 11925 },
    { rate: 0.12, threshold: 48475 },
    { rate: 0.22, threshold: 103350 },
    { rate: 0.24, threshold: 197300 },
    { rate: 0.32, threshold: 250525 },
    { rate: 0.35, threshold: 626350 },
    { rate: 0.37, threshold: Infinity },
  ],
  head_of_household: [
    { rate: 0.1, threshold: 17000 },
    { rate: 0.12, threshold: 64850 },
    { rate: 0.22, threshold: 103350 },
    { rate: 0.24, threshold: 197300 },
    { rate: 0.32, threshold: 250500 },
    { rate: 0.35, threshold: 626350 },
    { rate: 0.37, threshold: Infinity },
  ],
};

export interface TaxCalculation {
  tax: number;
  breakdown: string;
  taxableIncome: number;
}

export function calculateIncomeTax(
  income: number,
  deductions: number,
  filingStatus: FilingStatus,
): TaxCalculation {
  const standardDeduction = STANDARD_DEDUCTION_2025[filingStatus];
  const deductionUsed = Math.max(deductions, standardDeduction);
  const taxableIncome = Math.max(0, income - deductionUsed);

  const brackets = TAX_BRACKETS_2025[filingStatus];
  let remaining = taxableIncome;
  let prevThreshold = 0;
  let tax = 0;
  const parts: string[] = [];
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const cap = bracket.threshold;
    const amountInBracket = Math.min(remaining, cap - prevThreshold);
    const taxForBracket = amountInBracket * bracket.rate;
    tax += taxForBracket;
    if (amountInBracket > 0) {
      parts.push(
        `${(bracket.rate * 100).toFixed(0)}% on $${amountInBracket.toFixed(2)} = $${taxForBracket.toFixed(2)}`
      );
    }
    remaining -= amountInBracket;
    prevThreshold = cap;
  }

  const breakdown = [
    `Standard deduction used: $${standardDeduction.toLocaleString()}`,
    `Taxable income: $${taxableIncome.toFixed(2)}`,
    ...parts,
  ].join('\n');

  return { tax, breakdown, taxableIncome };
}
