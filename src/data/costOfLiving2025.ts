export interface RegionCost {
  housing: number;
  groceries: number;
  utilities: number;
  transportation: number;
  healthcare: number;
  miscellaneous: number;
}

export interface SourceMetadata {
  name: string;
  version: string;
  retrieved: string;
}

export interface CostOfLivingDataset {
  baseYear: number;
  source: SourceMetadata;
  regions: Record<string, RegionCost>;
}

export const costOfLiving2025: CostOfLivingDataset = {
  baseYear: 2025,
  source: {
    name: 'BEA Regional Price Parities',
    version: '2024',
    retrieved: '2025-08-30',
  },
  regions: {
    'New York-Newark-Jersey City, NY-NJ-PA': {
      housing: 25000,
      groceries: 6250,
      utilities: 3750,
      transportation: 7500,
      healthcare: 6250,
      miscellaneous: 5000,
    },
    'Los Angeles-Long Beach-Anaheim, CA': {
      housing: 22800,
      groceries: 5700,
      utilities: 3420,
      transportation: 6840,
      healthcare: 5700,
      miscellaneous: 4560,
    },
    'Chicago-Naperville-Elgin, IL-IN-WI': {
      housing: 21000,
      groceries: 5250,
      utilities: 3150,
      transportation: 6300,
      healthcare: 5250,
      miscellaneous: 4200,
    },
    'Houston-The Woodlands-Sugar Land, TX': {
      housing: 19000,
      groceries: 4750,
      utilities: 2850,
      transportation: 5700,
      healthcare: 4750,
      miscellaneous: 3800,
    },
    'Phoenix-Mesa-Scottsdale, AZ': {
      housing: 20000,
      groceries: 5000,
      utilities: 3000,
      transportation: 6000,
      healthcare: 5000,
      miscellaneous: 4000,
    },
    'Philadelphia-Camden-Wilmington, PA-NJ-DE-MD': {
      housing: 21400,
      groceries: 5350,
      utilities: 3210,
      transportation: 6420,
      healthcare: 5350,
      miscellaneous: 4280,
    },
    'San Francisco-Oakland-Berkeley, CA': {
      housing: 26000,
      groceries: 6500,
      utilities: 3900,
      transportation: 7800,
      healthcare: 6500,
      miscellaneous: 5200,
    },
    'Miami-Fort Lauderdale-West Palm Beach, FL': {
      housing: 20800,
      groceries: 5200,
      utilities: 3120,
      transportation: 6240,
      healthcare: 5200,
      miscellaneous: 4160,
    },
    'Washington-Arlington-Alexandria, DC-VA-MD-WV': {
      housing: 22400,
      groceries: 5600,
      utilities: 3360,
      transportation: 6720,
      healthcare: 5600,
      miscellaneous: 4480,
    },
    'Boston-Cambridge-Newton, MA-NH': {
      housing: 21800,
      groceries: 5450,
      utilities: 3270,
      transportation: 6540,
      healthcare: 5450,
      miscellaneous: 4360,
    },
  },
} as const;

export type Region = keyof typeof costOfLiving2025.regions;
