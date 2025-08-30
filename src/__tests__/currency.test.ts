import { getFxRate, convertCurrency, clearFxRateCache } from '@/lib/currency';

describe('currency code validation', () => {
  afterEach(() => {
    jest.resetAllMocks();
    clearFxRateCache();
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
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('getFxRate uses cached value when available', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 0.9 } }),
    });
    (globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

    const first = await getFxRate('usd', 'eur');
    const second = await getFxRate('usd', 'eur');

    expect(first).toBe(0.9);
    expect(second).toBe(0.9);
    expect(mockFetch).toHaveBeenCalledTimes(1);
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
