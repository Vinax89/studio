import { FilingStatus } from './types';
import { federalTaxBrackets2025 } from '@/data/federalTaxBrackets2025';

export function calculateFederalTax(income: number, filingStatus: FilingStatus): number {
  if (income <= 0) return 0;
  const data = federalTaxBrackets2025[filingStatus];
  const taxable = Math.max(0, income - data.standardDeduction);
  let tax = 0;
  let prev = 0;
  for (const bracket of data.brackets) {
    if (taxable <= prev) break;
    const cap = bracket.threshold;
    const amount = Math.min(taxable, cap) - prev;
    tax += amount * bracket.rate;
    prev = cap;
  }
  return tax;
}

export default calculateFederalTax;
