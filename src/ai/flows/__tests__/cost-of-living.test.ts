import { calculateCostOfLiving } from '../cost-of-living';

describe('calculateCostOfLiving', () => {
  it('computes expenses for California', async () => {
    const result = await calculateCostOfLiving({ location: 'CA', householdSize: 2 });
    expect(result.housing.monthly).toBeCloseTo(2840);
    expect(result.total.monthly).toBeCloseTo(6248);
  });

  it('computes expenses for Texas', async () => {
    const result = await calculateCostOfLiving({ location: 'TX', householdSize: 2 });
    expect(result.housing.monthly).toBeCloseTo(1860);
    expect(result.total.monthly).toBeCloseTo(4092);
  });
});
