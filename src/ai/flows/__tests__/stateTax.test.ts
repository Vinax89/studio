import { calculateStateTax } from '@/data/stateTaxRates';

describe('state tax calculations', () => {
  it.each([
    ['CA', 50000, 1664.41],
    ['NY', 50000, 2749.42],
    ['TX', 50000, 0],
  ])('computes %s tax for income %d', (state, income, expected) => {
    const tax = calculateStateTax(income, state as string);
    expect(tax).toBeCloseTo(expected, 2);
  });
});
