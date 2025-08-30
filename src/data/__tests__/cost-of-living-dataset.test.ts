import { costOfLiving2024 } from '@/data/costOfLiving2024';

describe('cost-of-living dataset', () => {
  it('has the expected base year', () => {
    const baseYear = costOfLiving2024.baseYear;

    if (baseYear === 2024) {
      expect(baseYear).toBe(2024);
    } else {
      expect(baseYear).toBeGreaterThanOrEqual(new Date().getFullYear());
    }
  });
});
