import { calculateStateTax } from '../state';

describe('calculateStateTax', () => {
  it('calculates California progressive tax', () => {
    expect(calculateStateTax(50000, 'CA', 'single')).toBeCloseTo(1444.33, 2);
  });

  it('calculates New York progressive tax for married filing jointly', () => {
    expect(calculateStateTax(120000, 'NY', 'married_jointly')).toBeCloseTo(6054.115, 3);
  });

  it('calculates Pennsylvania flat tax', () => {
    expect(calculateStateTax(50000, 'PA', 'single')).toBeCloseTo(1535, 2);
  });

  it('returns 0 for zero-tax state', () => {
    expect(calculateStateTax(90000, 'TX', 'single')).toBe(0);
  });

  it('returns 0 when state is missing', () => {
    expect(calculateStateTax(50000, 'ZZ', 'single')).toBe(0);
  });

  it('guards against negative income', () => {
    expect(calculateStateTax(-1000, 'CA', 'single')).toBe(0);
  });
});
