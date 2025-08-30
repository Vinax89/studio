import { getFxRate, convertCurrency } from '@/lib/currency';

describe('currency code validation', () => {
  const g = global as unknown as { fetch: typeof fetch };
  const originalFetch = g.fetch;

  afterEach(() => {
    g.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('getFxRate returns rate for valid codes', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 0.85 } }),
    }) as jest.MockedFunction<typeof fetch>;
    g.fetch = mockFetch;

    const rate = await getFxRate('usd', 'eur');

    expect(rate).toBe(0.85);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.exchangerate.host/latest?base=USD&symbols=EUR',
      expect.objectContaining({ signal: expect.any(Object) }),
    );
  });

  it('getFxRate throws on invalid code', async () => {
    const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
    g.fetch = mockFetch;

    await expect(getFxRate('US', 'EUR')).rejects.toThrow('Invalid currency code');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('convertCurrency returns converted amount for valid codes', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 0.5 } }),
    }) as jest.MockedFunction<typeof fetch>;
    g.fetch = mockFetch;

    const converted = await convertCurrency(10, 'usd', 'eur');

    expect(converted).toBe(5);
  });

  it('convertCurrency returns original amount for invalid codes', async () => {
    const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
    g.fetch = mockFetch;

    const converted = await convertCurrency(10, 'u$', 'eur');

    expect(converted).toBe(10);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
