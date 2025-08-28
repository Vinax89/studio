export interface CostOfLivingEntry {
  state: string; // full state name
  index: number; // cost of living index where 100 is national average
}

// Source: Council for Community and Economic Research, Cost of Living Index (Q1 2024).
// Values are approximate and scaled so that 100 represents the U.S. average.
export const costOfLivingData: Record<string, CostOfLivingEntry> = {
  AL: { state: 'Alabama', index: 88 },
  AK: { state: 'Alaska', index: 125 },
  AZ: { state: 'Arizona', index: 96 },
  AR: { state: 'Arkansas', index: 84 },
  CA: { state: 'California', index: 142 },
  CO: { state: 'Colorado', index: 103 },
  CT: { state: 'Connecticut', index: 116 },
  DE: { state: 'Delaware', index: 103 },
  DC: { state: 'District of Columbia', index: 149 },
  FL: { state: 'Florida', index: 100 },
  GA: { state: 'Georgia', index: 90 },
  HI: { state: 'Hawaii', index: 194 },
  ID: { state: 'Idaho', index: 94 },
  IL: { state: 'Illinois', index: 94 },
  IN: { state: 'Indiana', index: 88 },
  IA: { state: 'Iowa', index: 90 },
  KS: { state: 'Kansas', index: 88 },
  KY: { state: 'Kentucky', index: 90 },
  LA: { state: 'Louisiana', index: 94 },
  ME: { state: 'Maine', index: 112 },
  MD: { state: 'Maryland', index: 124 },
  MA: { state: 'Massachusetts', index: 135 },
  MI: { state: 'Michigan', index: 92 },
  MN: { state: 'Minnesota', index: 102 },
  MS: { state: 'Mississippi', index: 86 },
  MO: { state: 'Missouri', index: 89 },
  MT: { state: 'Montana', index: 104 },
  NE: { state: 'Nebraska', index: 92 },
  NV: { state: 'Nevada', index: 104 },
  NH: { state: 'New Hampshire', index: 115 },
  NJ: { state: 'New Jersey', index: 113 },
  NM: { state: 'New Mexico', index: 91 },
  NY: { state: 'New York', index: 128 },
  NC: { state: 'North Carolina', index: 92 },
  ND: { state: 'North Dakota', index: 95 },
  OH: { state: 'Ohio', index: 90 },
  OK: { state: 'Oklahoma', index: 87 },
  OR: { state: 'Oregon', index: 121 },
  PA: { state: 'Pennsylvania', index: 97 },
  RI: { state: 'Rhode Island', index: 110 },
  SC: { state: 'South Carolina', index: 92 },
  SD: { state: 'South Dakota', index: 95 },
  TN: { state: 'Tennessee', index: 92 },
  TX: { state: 'Texas', index: 93 },
  UT: { state: 'Utah', index: 100 },
  VT: { state: 'Vermont', index: 116 },
  VA: { state: 'Virginia', index: 103 },
  WA: { state: 'Washington', index: 120 },
  WV: { state: 'West Virginia', index: 90 },
  WI: { state: 'Wisconsin', index: 95 },
  WY: { state: 'Wyoming', index: 93 },
};

export function getCostOfLivingIndex(state: string): number {
  const entry = costOfLivingData[state.toUpperCase()];
  return entry ? entry.index : 100; // default to national average
}
