export interface RegionCost {
  housing: number;
  groceries: number;
  utilities: number;
  transportation: number;
  healthcare: number;
  miscellaneous: number;
}

export interface CostOfLivingDataset {
  baseYear: number;
  source: string;
  regions: Record<string, RegionCost>;
}

export const costOfLiving2025: CostOfLivingDataset = {
  baseYear: 2025,
  source: 'BEA Regional Price Parities 2025',
  regions: {
    California: {
      housing: 24000,
      groceries: 5000,
      utilities: 3000,
      transportation: 7000,
      healthcare: 6000,
      miscellaneous: 4000,
    },
    Texas: {
      housing: 18000,
      groceries: 4500,
      utilities: 2800,
      transportation: 6000,
      healthcare: 5000,
      miscellaneous: 3500,
    },
  },
} as const;

export type Region = keyof typeof costOfLiving2025.regions;
