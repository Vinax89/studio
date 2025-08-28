import { FilingStatus } from '@/lib/tax/types';

export interface FederalBracket {
  threshold: number;
  rate: number;
}

export interface FederalTaxInfo {
  standardDeduction: number;
  brackets: FederalBracket[];
}

export const federalTaxBrackets2025: Record<FilingStatus, FederalTaxInfo> = {
  single: {
    standardDeduction: 15000,
    brackets: [
      { threshold: 11925, rate: 0.1 },
      { threshold: 48475, rate: 0.12 },
      { threshold: 103350, rate: 0.22 },
      { threshold: 197300, rate: 0.24 },
      { threshold: 250525, rate: 0.32 },
      { threshold: 626350, rate: 0.35 },
      { threshold: Infinity, rate: 0.37 },
    ],
  },
  married_jointly: {
    standardDeduction: 30000,
    brackets: [
      { threshold: 23850, rate: 0.1 },
      { threshold: 96950, rate: 0.12 },
      { threshold: 206700, rate: 0.22 },
      { threshold: 394600, rate: 0.24 },
      { threshold: 501050, rate: 0.32 },
      { threshold: 751600, rate: 0.35 },
      { threshold: Infinity, rate: 0.37 },
    ],
  },
  married_separately: {
    standardDeduction: 15000,
    brackets: [
      { threshold: 11925, rate: 0.1 },
      { threshold: 48475, rate: 0.12 },
      { threshold: 103350, rate: 0.22 },
      { threshold: 197300, rate: 0.24 },
      { threshold: 250525, rate: 0.32 },
      { threshold: 626350, rate: 0.35 },
      { threshold: Infinity, rate: 0.37 },
    ],
  },
  head_of_household: {
    standardDeduction: 22500,
    brackets: [
      { threshold: 17000, rate: 0.1 },
      { threshold: 64850, rate: 0.12 },
      { threshold: 103350, rate: 0.22 },
      { threshold: 197300, rate: 0.24 },
      { threshold: 250500, rate: 0.32 },
      { threshold: 626350, rate: 0.35 },
      { threshold: Infinity, rate: 0.37 },
    ],
  },
};

export default federalTaxBrackets2025;
