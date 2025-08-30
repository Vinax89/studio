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

  it('getFxRate returns reciprocal from cache', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 0.25 } }),
    });
    (globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

    const rate = await getFxRate('usd', 'eur');
    const reciprocal = await getFxRate('eur', 'usd');

    expect(rate).toBe(0.25);
    expect(reciprocal).toBeCloseTo(4);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('getFxRate reuses in-flight request for reciprocal lookup', async () => {
    let resolveFetch: (value: unknown) => void;
    const fetchPromise = new Promise((res) => {
      resolveFetch = res;
    });
    const mockFetch = jest.fn().mockReturnValue(fetchPromise);
    (globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

    const p1 = getFxRate('usd', 'eur');
    const p2 = getFxRate('eur', 'usd');

    resolveFetch({ ok: true, json: async () => ({ rates: { EUR: 2 } }) });

    const rate = await p1;
    const reciprocal = await p2;

    expect(rate).toBe(2);
    expect(reciprocal).toBeCloseTo(0.5);
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
