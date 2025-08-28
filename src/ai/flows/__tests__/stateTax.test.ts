import { calculateStateTax } from '@/data/stateTaxRates';

describe('state tax calculations', () => {
  it.each([
    ['CA', 'single', 50000, 1664.41],
    ['NY', 'single', 50000, 2749.42],
    ['TX', 'single', 50000, 0],
    ['CA', 'married_jointly', 50000, 840.34],
    ['NY', 'married_jointly', 50000, 2513.84],
  ])(
    'computes %s tax for %s filers with income %d',
    (state, status, income, expected) => {
      const tax = calculateStateTax(income, state as string, status as any);
      expect(tax).toBeCloseTo(expected, 2);
    }
  );
});
