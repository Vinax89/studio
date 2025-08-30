import { costOfLiving2024, MetroArea } from '@/data/costOfLiving2024';

export interface RegionCost {
  housing: number;
  groceries: number;
  utilities: number;
  transportation: number;
  healthcare: number;
  miscellaneous: number;
}

export interface CalculateCostOfLivingInput {
  metro: MetroArea;
  adults: number;
  children: number;
}

export interface CostOfLivingBreakdown {
  monthly: { total: number; categories: RegionCost };
  annual: { total: number; categories: RegionCost };
}

const BASELINE_COSTS: RegionCost = {
  housing: 20000,
  groceries: 5000,
  utilities: 3000,
  transportation: 6000,
  healthcare: 5000,
  miscellaneous: 4000,
};

const CHILD_MULTIPLIERS: Record<keyof RegionCost, number> = {
  housing: 0.5,
  groceries: 0.7,
  utilities: 0.5,
  transportation: 0.5,
  healthcare: 0.7,
  miscellaneous: 0.5,
};

export function calculateCostOfLiving({ metro, adults, children }: CalculateCostOfLivingInput): CostOfLivingBreakdown {
  if (adults <= 0 || children < 0) {
    throw new Error('Invalid household composition');
  }
  const metroInfo = costOfLiving2024.metros[metro];
  if (!metroInfo) {
    throw new Error(`Unknown metro: ${metro}`);
  }

  const annualCategories = Object.keys(BASELINE_COSTS).reduce((acc, key) => {
    const k = key as keyof RegionCost;
    const base = BASELINE_COSTS[k] * metroInfo.rpp;
    const amount = base * adults + base * CHILD_MULTIPLIERS[k] * children;
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
