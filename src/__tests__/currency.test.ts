import { getFxRate, convertCurrency } from '@/lib/currency';

describe('currency code validation', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getFxRate returns rate for valid codes', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 0.85 } }),
    });
    (globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

    const rate = await getFxRate('usd', 'eur');

    expect(rate).toBe(0.85);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.exchangerate.host/latest?base=USD&symbols=EUR',
      expect.objectContaining({ signal: expect.any(Object) }),
    );
  });

  it('getFxRate throws on invalid code', async () => {
    const mockFetch = jest.fn();
    (globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

    await expect(getFxRate('US', 'EUR')).rejects.toThrow('Invalid currency code');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('convertCurrency returns converted amount for valid codes', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 0.5 } }),
    });
    (globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

    const converted = await convertCurrency(10, 'usd', 'eur');

    expect(converted).toBe(5);
  });

  it('convertCurrency throws for invalid codes', async () => {
    const mockFetch = jest.fn();
    (globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

    await expect(convertCurrency(10, 'u$', 'eur')).rejects.toThrow(
      'Invalid currency code',
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
