import { costOfLiving2025 } from '@/data/costOfLiving2025';

describe('cost-of-living dataset', () => {
  it('is current', () => {
    expect(costOfLiving2025.baseYear).toBeGreaterThanOrEqual(new Date().getFullYear());
  });
});
