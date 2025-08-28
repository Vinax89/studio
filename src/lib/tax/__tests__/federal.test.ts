import { calculateFederalTax } from '../federal';
import { FilingStatus } from '../types';

describe('calculateFederalTax', () => {
  it('returns 0 when income does not exceed deduction', () => {
    expect(calculateFederalTax(10000, 'single')).toBe(0);
  });

  it('calculates tax for single filer across brackets', () => {
    expect(calculateFederalTax(60000, 'single')).toBeCloseTo(5161.5, 2);
  });

  it('calculates tax for married filing jointly', () => {
    expect(calculateFederalTax(100000, 'married_jointly')).toBeCloseTo(7923, 2);
  });

  it('guards against negative income', () => {
    expect(calculateFederalTax(-5000, 'single')).toBe(0);
  });
});
