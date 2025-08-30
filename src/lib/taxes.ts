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
// Payroll tax constants
export const SOCIAL_SECURITY_RATE = 0.062;
export const MEDICARE_RATE = 0.0145;
export const ADDITIONAL_MEDICARE_RATE = 0.009;
export const SOCIAL_SECURITY_WAGE_BASE = 168_600;

const ADDITIONAL_MEDICARE_THRESHOLDS: Record<FilingStatus, number> = {
  single: 200_000,
  married_jointly: 250_000,
  married_separately: 125_000,
  head_of_household: 200_000,
};

export interface PayrollTaxCalculation {
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  total: number;
}

export interface TaxCalculation {
  incomeTax: number;
  payrollTaxes: PayrollTaxCalculation;
  breakdown: string;
  taxableIncome: number;
}

export function calculateSocialSecurityTax(wages: number): number {
  return Math.min(wages, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE;
}

export function calculateMedicareTax(
  wages: number,
  filingStatus: FilingStatus,
): { medicare: number; additionalMedicare: number } {
  const medicare = wages * MEDICARE_RATE;
  const threshold = ADDITIONAL_MEDICARE_THRESHOLDS[filingStatus];
  const additionalMedicare = Math.max(0, wages - threshold) * ADDITIONAL_MEDICARE_RATE;
  return { medicare, additionalMedicare };
}

export function calculatePayrollTaxes(
  wages: number,
  filingStatus: FilingStatus,
): PayrollTaxCalculation {
  const socialSecurity = calculateSocialSecurityTax(wages);
  const { medicare, additionalMedicare } = calculateMedicareTax(
    wages,
    filingStatus,
  );
  const total = socialSecurity + medicare + additionalMedicare;
  return { socialSecurity, medicare, additionalMedicare, total };
}

export function calculateTaxes(
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
  let incomeTax = 0;
  const parts: string[] = [];
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const cap = bracket.threshold;
    const amountInBracket = Math.min(remaining, cap - prevThreshold);
    const taxForBracket = amountInBracket * bracket.rate;
    incomeTax += taxForBracket;
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

  const payrollTaxes = calculatePayrollTaxes(income, filingStatus);
  return { incomeTax, payrollTaxes, breakdown, taxableIncome };
}
