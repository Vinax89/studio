import { FilingStatus } from './types';
import { stateTaxBrackets2025, StateTaxInfo, StateBracket } from '@/data/stateTaxBrackets2025';

function getDeduction(info: StateTaxInfo, filingStatus: FilingStatus): number {
  let deduction = 0;
  if (info.standardDeduction !== undefined) {
    deduction +=
      typeof info.standardDeduction === 'number'
        ? info.standardDeduction
        : info.standardDeduction[filingStatus] || 0;
  }
  if (info.personalAllowance !== undefined) {
    deduction +=
      typeof info.personalAllowance === 'number'
        ? info.personalAllowance
        : info.personalAllowance[filingStatus] || 0;
  }
  return deduction;
}

export function calculateStateTax(
  income: number,
  state: string,
  filingStatus: FilingStatus,
): number {
  if (income <= 0) return 0;
  const info = stateTaxBrackets2025[state.toUpperCase()];
  if (!info) return 0;
  const deduction = getDeduction(info, filingStatus);
  const taxable = Math.max(0, income - deduction);
  if (taxable <= 0) return 0;

  if (info.type === 'flat') {
    const rate = info.brackets[0]?.rate ?? 0;
    return taxable * rate;
  }

  let tax = 0;
  let prev = 0;
  for (const bracket of info.brackets) {
    if ('threshold' in bracket) {
      if (taxable <= prev) break;
      const cap = bracket.threshold;
      const amount = Math.min(taxable, cap) - prev;
      tax += amount * bracket.rate;
      prev = cap;
    } else {
      if (taxable > bracket.min) {
        const upper = Math.min(taxable, bracket.max);
        const amount = upper - bracket.min;
        if (amount > 0) tax += amount * bracket.rate;
      }
    }
  }
  return tax;
}

export default calculateStateTax;
