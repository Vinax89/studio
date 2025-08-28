export interface TaxBracket {
  rate: number; // as decimal, e.g., 0.05 for 5%
  upTo: number | null; // upper bound of the bracket in USD, null for no limit
}

export type FilingStatus =
  | 'single'
  | 'married_jointly'
  | 'married_separately'
  | 'head_of_household';

interface BaseStateTaxInfo {
  name: string;
  brackets: TaxBracket[]; // single filer brackets
}

export interface StateTaxInfo {
  name: string;
  brackets: Record<FilingStatus, TaxBracket[]>;
}

const BASE_STATE_TAX_RATES: Record<string, BaseStateTaxInfo> = {
  AL: { name: 'Alabama', brackets: [{ rate: 0.05, upTo: null }] },
  AK: { name: 'Alaska', brackets: [{ rate: 0, upTo: null }] },
  AZ: { name: 'Arizona', brackets: [{ rate: 0.025, upTo: null }] },
  AR: { name: 'Arkansas', brackets: [{ rate: 0.049, upTo: null }] },
  CA: {
    name: 'California',
    brackets: [
      { rate: 0.01, upTo: 10099 },
      { rate: 0.02, upTo: 23942 },
      { rate: 0.04, upTo: 37788 },
      { rate: 0.06, upTo: 52455 },
      { rate: 0.08, upTo: 66295 },
      { rate: 0.093, upTo: 338639 },
      { rate: 0.103, upTo: 406364 },
      { rate: 0.113, upTo: 677275 },
      { rate: 0.123, upTo: 1000000 },
      { rate: 0.133, upTo: null },
    ],
  },
  CO: { name: 'Colorado', brackets: [{ rate: 0.044, upTo: null }] },
  CT: { name: 'Connecticut', brackets: [{ rate: 0.05, upTo: null }] },
  DE: { name: 'Delaware', brackets: [{ rate: 0.052, upTo: null }] },
  DC: { name: 'District of Columbia', brackets: [{ rate: 0.085, upTo: null }] },
  FL: { name: 'Florida', brackets: [{ rate: 0, upTo: null }] },
  GA: { name: 'Georgia', brackets: [{ rate: 0.0575, upTo: null }] },
  HI: { name: 'Hawaii', brackets: [{ rate: 0.0825, upTo: null }] },
  ID: { name: 'Idaho', brackets: [{ rate: 0.058, upTo: null }] },
  IL: { name: 'Illinois', brackets: [{ rate: 0.0495, upTo: null }] },
  IN: { name: 'Indiana', brackets: [{ rate: 0.0315, upTo: null }] },
  IA: { name: 'Iowa', brackets: [{ rate: 0.0482, upTo: null }] },
  KS: { name: 'Kansas', brackets: [{ rate: 0.052, upTo: null }] },
  KY: { name: 'Kentucky', brackets: [{ rate: 0.045, upTo: null }] },
  LA: { name: 'Louisiana', brackets: [{ rate: 0.0425, upTo: null }] },
  ME: { name: 'Maine', brackets: [{ rate: 0.0715, upTo: null }] },
  MD: { name: 'Maryland', brackets: [{ rate: 0.0575, upTo: null }] },
  MA: { name: 'Massachusetts', brackets: [{ rate: 0.05, upTo: null }] },
  MI: { name: 'Michigan', brackets: [{ rate: 0.0425, upTo: null }] },
  MN: { name: 'Minnesota', brackets: [{ rate: 0.0985, upTo: null }] },
  MS: { name: 'Mississippi', brackets: [{ rate: 0.05, upTo: null }] },
  MO: { name: 'Missouri', brackets: [{ rate: 0.0495, upTo: null }] },
  MT: { name: 'Montana', brackets: [{ rate: 0.0675, upTo: null }] },
  NE: { name: 'Nebraska', brackets: [{ rate: 0.0664, upTo: null }] },
  NV: { name: 'Nevada', brackets: [{ rate: 0, upTo: null }] },
  NH: { name: 'New Hampshire', brackets: [{ rate: 0, upTo: null }] },
  NJ: { name: 'New Jersey', brackets: [{ rate: 0.0637, upTo: null }] },
  NM: { name: 'New Mexico', brackets: [{ rate: 0.049, upTo: null }] },
  NY: {
    name: 'New York',
    brackets: [
      { rate: 0.04, upTo: 8500 },
      { rate: 0.045, upTo: 11700 },
      { rate: 0.0525, upTo: 13900 },
      { rate: 0.059, upTo: 21400 },
      { rate: 0.0597, upTo: 80650 },
      { rate: 0.0633, upTo: 215400 },
      { rate: 0.0657, upTo: 1077550 },
      { rate: 0.0685, upTo: 5000000 },
      { rate: 0.0965, upTo: 25000000 },
      { rate: 0.103, upTo: 50000000 },
      { rate: 0.109, upTo: null },
    ],
  },
  NC: { name: 'North Carolina', brackets: [{ rate: 0.0475, upTo: null }] },
  ND: { name: 'North Dakota', brackets: [{ rate: 0.029, upTo: null }] },
  OH: { name: 'Ohio', brackets: [{ rate: 0.0375, upTo: null }] },
  OK: { name: 'Oklahoma', brackets: [{ rate: 0.0475, upTo: null }] },
  OR: { name: 'Oregon', brackets: [{ rate: 0.099, upTo: null }] },
  PA: { name: 'Pennsylvania', brackets: [{ rate: 0.0307, upTo: null }] },
  RI: { name: 'Rhode Island', brackets: [{ rate: 0.0599, upTo: null }] },
  SC: { name: 'South Carolina', brackets: [{ rate: 0.0624, upTo: null }] },
  SD: { name: 'South Dakota', brackets: [{ rate: 0, upTo: null }] },
  TN: { name: 'Tennessee', brackets: [{ rate: 0, upTo: null }] },
  TX: { name: 'Texas', brackets: [{ rate: 0, upTo: null }] },
  UT: { name: 'Utah', brackets: [{ rate: 0.0485, upTo: null }] },
  VT: { name: 'Vermont', brackets: [{ rate: 0.0875, upTo: null }] },
  VA: { name: 'Virginia', brackets: [{ rate: 0.0575, upTo: null }] },
  WA: { name: 'Washington', brackets: [{ rate: 0, upTo: null }] },
  WV: { name: 'West Virginia', brackets: [{ rate: 0.0512, upTo: null }] },
  WI: { name: 'Wisconsin', brackets: [{ rate: 0.0765, upTo: null }] },
  WY: { name: 'Wyoming', brackets: [{ rate: 0, upTo: null }] },
};

function cloneBrackets(brackets: TaxBracket[]): Record<FilingStatus, TaxBracket[]> {
  return {
    single: brackets,
    married_jointly: brackets,
    married_separately: brackets,
    head_of_household: brackets,
  };
}

export const STATE_TAX_RATES: Record<string, StateTaxInfo> = Object.fromEntries(
  Object.entries(BASE_STATE_TAX_RATES).map(([code, info]) => [
    code,
    { name: info.name, brackets: cloneBrackets(info.brackets) },
  ])
) as Record<string, StateTaxInfo>;

// Adjust brackets for states with different thresholds by status
STATE_TAX_RATES.CA.brackets.married_jointly = STATE_TAX_RATES.CA.brackets.single.map(
  (b) => ({ ...b, upTo: b.upTo === null ? null : b.upTo * 2 })
);
STATE_TAX_RATES.NY.brackets.married_jointly = STATE_TAX_RATES.NY.brackets.single.map(
  (b) => ({ ...b, upTo: b.upTo === null ? null : b.upTo * 2 })
);

export const US_STATES = Object.entries(STATE_TAX_RATES).map(([code, info]) => ({
  code,
  name: info.name,
}));

export function calculateStateTax(
  taxableIncome: number,
  stateCode: string,
  status: FilingStatus
): number {
  const info = STATE_TAX_RATES[stateCode];
  if (!info) return 0;
  const brackets = info.brackets[status] ?? info.brackets.single;
  let tax = 0;
  let last = 0;
  for (const bracket of brackets) {
    const cap = bracket.upTo ?? taxableIncome;
    const amount = Math.max(Math.min(cap, taxableIncome) - last, 0);
    tax += amount * bracket.rate;
    last = cap;
    if (taxableIncome <= cap) break;
  }
  return tax;
}

