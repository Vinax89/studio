import { calculateCostOfLiving } from '@/ai/flows/cost-of-living';

describe('calculateCostOfLiving', () => {
  it('computes Abilene household costs', () => {
    const result = calculateCostOfLiving({
      metro: 'Abilene, TX (Metropolitan Statistical Area)',
      adults: 2,
      children: 1,
    });
    expect(result.annual.total).toBeCloseTo(98384.66, 1);
    expect(result.monthly.total).toBeCloseTo(8198.72, 2);
    expect(result.annual.categories.housing).toBeCloseTo(44924.5, 1);
  });

  it('computes San Francisco household costs', () => {
    const result = calculateCostOfLiving({
      metro: 'San Francisco-Oakland-Berkeley, CA (Metropolitan Statistical Area)',
      adults: 1,
      children: 2,
    });
    expect(result.annual.total).toBeCloseTo(106402.5, 1);
    expect(result.monthly.total).toBeCloseTo(8866.88, 2);
    expect(result.annual.categories.groceries).toBeCloseTo(14187, 0);
  });
});
