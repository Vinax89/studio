import { costOfLiving2024 } from '@/data/costOfLiving2024';

describe('cost-of-living dataset', () => {
  it('is current', () => {
    expect(costOfLiving2024.baseYear).toBeGreaterThanOrEqual(new Date().getFullYear());
  });
});
