import { costOfLiving2024 } from '@/data/costOfLiving2024';

describe('cost-of-living dataset', () => {
  it('uses the 2024 base year', () => {
    expect(costOfLiving2024.baseYear).toBe(2024);
  });
});
