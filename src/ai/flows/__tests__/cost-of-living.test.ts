import { calculateCostOfLiving } from '@/ai/flows/cost-of-living';

describe('calculateCostOfLiving', () => {
  it('computes California household costs', () => {
    const result = calculateCostOfLiving({ region: 'California', adults: 2, children: 1 });
    expect(result.annual.total).toBeCloseTo(124700);
    expect(result.monthly.total).toBeCloseTo(10391.67, 2);
    expect(result.annual.categories.housing).toBeCloseTo(60000);
  });

  it('computes Texas household costs', () => {
    const result = calculateCostOfLiving({ region: 'Texas', adults: 1, children: 2 });
    expect(result.annual.total).toBeCloseTo(83400);
    expect(result.monthly.total).toBeCloseTo(6950);
    expect(result.annual.categories.groceries).toBeCloseTo(10800);
  });
});
