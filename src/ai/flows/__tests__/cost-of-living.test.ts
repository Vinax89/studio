import { calculateCostOfLiving } from '@/ai/flows/cost-of-living';

describe('calculateCostOfLiving', () => {
  it('computes New York household costs', () => {
    const result = calculateCostOfLiving({ region: 'New York-Newark-Jersey City, NY-NJ-PA', adults: 2, children: 1 });
    expect(result.annual.total).toBeCloseTo(136875);
    expect(result.monthly.total).toBeCloseTo(11406.25, 2);
    expect(result.annual.categories.housing).toBeCloseTo(62500);
  });

  it('computes Houston household costs', () => {
    const result = calculateCostOfLiving({ region: 'Houston-The Woodlands-Sugar Land, TX', adults: 1, children: 2 });
    expect(result.annual.total).toBeCloseTo(85500);
    expect(result.monthly.total).toBeCloseTo(7125);
    expect(result.annual.categories.groceries).toBeCloseTo(11400);
  });
});
