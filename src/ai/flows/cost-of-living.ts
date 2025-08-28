import { costOfLiving2024, Region, RegionCost } from '@/data/costOfLiving2024';

export interface CalculateCostOfLivingInput {
  region: Region;
  adults: number;
  children: number;
}

export interface CostOfLivingBreakdown {
  monthly: { total: number; categories: RegionCost };
  annual: { total: number; categories: RegionCost };
}

const CHILD_MULTIPLIERS: Record<keyof RegionCost, number> = {
  housing: 0.5,
  groceries: 0.7,
  utilities: 0.5,
  transportation: 0.5,
  healthcare: 0.7,
  miscellaneous: 0.5,
};

export function calculateCostOfLiving({ region, adults, children }: CalculateCostOfLivingInput): CostOfLivingBreakdown {
  if (adults <= 0 || children < 0) {
    throw new Error('Invalid household composition');
  }
  const base = costOfLiving2024.regions[region];
  if (!base) {
    throw new Error(`Unknown region: ${region}`);
  }

  const annualCategories = Object.keys(base).reduce((acc, key) => {
    const k = key as keyof RegionCost;
    const amount = base[k] * adults + base[k] * CHILD_MULTIPLIERS[k] * children;
    acc[k] = amount;
    return acc;
  }, {} as RegionCost);

  const annualTotal = Object.values(annualCategories).reduce((sum, val) => sum + val, 0);
  const monthlyCategories = Object.keys(annualCategories).reduce((acc, key) => {
    const k = key as keyof RegionCost;
    acc[k] = annualCategories[k] / 12;
    return acc;
  }, {} as RegionCost);
  const monthlyTotal = annualTotal / 12;

  return {
    monthly: { total: monthlyTotal, categories: monthlyCategories },
    annual: { total: annualTotal, categories: annualCategories },
  };
}
