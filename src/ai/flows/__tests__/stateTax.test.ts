import { calculateStateTax, FilingStatus } from '@/data/stateTaxRates';

describe('state tax calculations', () => {
  it.each<readonly [string, FilingStatus, number, number]>([
    ['CA', 'single', 50000, 1664.41],
    ['NY', 'single', 50000, 2749.42],
    ['TX', 'single', 50000, 0],
    ['CA', 'married_jointly', 200000, 12106.95],
  ])('computes %s tax for %s filer with income %d', (state, status, income, expected) => {
    const tax = calculateStateTax(income, state as string, status);
    expect(tax).toBeCloseTo(expected, 2);
  });
});
