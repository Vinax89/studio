jest.mock('@/ai/genkit', () => ({ ai: { definePrompt: () => async () => ({ output: { text: '' } }) } }));
import { estimateTax } from '../tax-estimation';

describe('tax estimation flow', () => {
  it('handles progressive state with local tax for single filer', async () => {
    const res = await estimateTax({
      income: 60000,
      filingStatus: 'single',
      state: 'CA',
      localRate: 1,
    });
    expect(res.estimatedTax).toBeCloseTo(7929.65, 2);
    expect(res.federalTax).toBeCloseTo(5161.5, 2);
    expect(res.stateTax).toBeCloseTo(2168.15, 2);
    expect(res.localTax).toBeCloseTo(600, 2);
    expect(res.taxRate).toBeCloseTo(13.22, 2);
  });

  it('handles flat tax state for married filing jointly', async () => {
    const res = await estimateTax({
      income: 80000,
      filingStatus: 'married_jointly',
      state: 'PA',
    });
    expect(res.stateTax).toBeCloseTo(2456, 2);
    expect(res.federalTax).toBeCloseTo(5523, 2);
    expect(res.estimatedTax).toBeCloseTo(7979, 2);
    expect(res.taxRate).toBeCloseTo(9.97, 2);
  });

  it('returns zero state tax for a zero-tax state', async () => {
    const res = await estimateTax({
      income: 70000,
      filingStatus: 'head_of_household',
      state: 'TX',
    });
    expect(res.stateTax).toBe(0);
    expect(res.federalTax).toBeCloseTo(5360, 2);
    expect(res.estimatedTax).toBeCloseTo(5360, 2);
  });
});
