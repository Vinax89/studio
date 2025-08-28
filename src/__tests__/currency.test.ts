import {
  convertCurrency,
  setFxCacheTTL,
  __clearFxCache,
} from '@/lib/currency';

describe('currency caching', () => {
  beforeEach(() => {
    __clearFxCache();
    setFxCacheTTL(1000);
    jest.resetAllMocks();
  });

  it('fetches and caches rate on miss', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 2 } }),
    } as any);

    const result = await convertCurrency(10, 'USD', 'EUR');
    expect(result).toBe(20);
    expect((global as any).fetch).toHaveBeenCalledTimes(1);

    await convertCurrency(10, 'USD', 'EUR');
    expect((global as any).fetch).toHaveBeenCalledTimes(1); // cache hit
  });

  it('uses stale cache when API fails', async () => {
    setFxCacheTTL(0); // immediately expire
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 2 } }),
    } as any);

    await convertCurrency(10, 'USD', 'EUR'); // prime cache

    ((global as any).fetch as jest.Mock).mockRejectedValue(new Error('network'));
    const result = await convertCurrency(10, 'USD', 'EUR');
    expect(result).toBe(20);
  });

  it('throws when API fails and no cache', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('down'));
    await expect(convertCurrency(10, 'USD', 'EUR')).rejects.toThrow(
      'Failed to fetch FX rate',
    );
  });
});

