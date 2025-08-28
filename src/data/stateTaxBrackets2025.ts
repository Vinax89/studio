import { FilingStatus } from '@/lib/tax/types';

export interface ThresholdBracket {
  threshold: number;
  rate: number;
}

export interface RangeBracket {
  min: number;
  max: number;
  rate: number;
}

export type StateBracket = ThresholdBracket | RangeBracket;

export interface StateTaxInfo {
  type: 'progressive' | 'flat';
  brackets: StateBracket[];
  standardDeduction?: Record<FilingStatus, number> | number;
  personalAllowance?: Record<FilingStatus, number> | number;
}

export const stateTaxBrackets2025: Record<string, StateTaxInfo> = {
  CA: {
    type: 'progressive',
    standardDeduction: {
      single: 5374,
      married_jointly: 10748,
      married_separately: 5374,
      head_of_household: 10748,
    },
    brackets: [
      { threshold: 9325, rate: 0.01 },
      { threshold: 22107, rate: 0.02 },
      { threshold: 34892, rate: 0.04 },
      { threshold: 48435, rate: 0.06 },
      { threshold: 61214, rate: 0.08 },
      { threshold: 312686, rate: 0.093 },
      { threshold: 375221, rate: 0.103 },
      { threshold: 625369, rate: 0.113 },
      { threshold: Infinity, rate: 0.123 },
    ],
  },
  NY: {
    type: 'progressive',
    standardDeduction: {
      single: 8000,
      married_jointly: 16050,
      married_separately: 8000,
      head_of_household: 16050,
    },
    brackets: [
      { threshold: 8500, rate: 0.04 },
      { threshold: 11700, rate: 0.045 },
      { threshold: 13900, rate: 0.0525 },
      { threshold: 21400, rate: 0.059 },
      { threshold: 80650, rate: 0.0597 },
      { threshold: 215400, rate: 0.0633 },
      { threshold: 1077550, rate: 0.0685 },
      { threshold: 5000000, rate: 0.0965 },
      { threshold: 25000000, rate: 0.103 },
      { threshold: Infinity, rate: 0.109 },
    ],
  },
  // Flat tax example
  PA: {
    type: 'flat',
    brackets: [{ threshold: Infinity, rate: 0.0307 }],
  },
  // Zero income tax states
  AK: { type: 'flat', brackets: [{ threshold: Infinity, rate: 0 }] },
  FL: { type: 'flat', brackets: [{ threshold: Infinity, rate: 0 }] },
  NV: { type: 'flat', brackets: [{ threshold: Infinity, rate: 0 }] },
  SD: { type: 'flat', brackets: [{ threshold: Infinity, rate: 0 }] },
  TN: { type: 'flat', brackets: [{ threshold: Infinity, rate: 0 }] },
  TX: { type: 'flat', brackets: [{ threshold: Infinity, rate: 0 }] },
  WA: { type: 'flat', brackets: [{ threshold: Infinity, rate: 0 }] },
  WY: { type: 'flat', brackets: [{ threshold: Infinity, rate: 0 }] },
  NH: { type: 'flat', brackets: [{ threshold: Infinity, rate: 0 }] },
};

export default stateTaxBrackets2025;
