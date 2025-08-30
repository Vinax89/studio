import { z } from 'zod';

const fxRateCache = new Map<string, { rate: number; ts: number }>();
const fxRateRequests = new Map<string, Promise<number>>();
const FX_RATE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/);

function parseCurrencyCode(code: string): string {
  const parsed = currencyCodeSchema.safeParse(code.trim().toUpperCase());
  if (!parsed.success) {
    throw new Error('Invalid currency code');
  }
  return parsed.data;
}

export async function getFxRate(from: string, to: string): Promise<number> {
  const fromCode = parseCurrencyCode(from);
  const toCode = parseCurrencyCode(to);
  if (fromCode === toCode) return 1;

  const cacheKey = `${fromCode}-${toCode}`;
  const now = Date.now();
  const cache = fxRateCache.get(cacheKey);
  if (cache && now - cache.ts < FX_RATE_TTL_MS) {
    return cache.rate;
  }

  const inFlight = fxRateRequests.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const promise = (async () => {
    let res: Response;
    try {
      res = await fetch(
        `https://api.exchangerate.host/latest?base=${fromCode}&symbols=${toCode}`,
        { signal: controller.signal },
      );
    } catch (err) {
      if (controller.signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
        throw new Error(
          `FX rate request from ${fromCode} to ${toCode} timed out after 5s`,
        );
      }
      throw new Error(
        `Network error while fetching FX rates: ${
          err instanceof Error ? err.message : err
        }`,
      );
    } finally {
      clearTimeout(timeout);
    }
    if (!res.ok) {
      throw new Error('Failed to fetch FX rates');
    }
    const data = await res.json();
    const rate = data?.rates?.[toCode];
    if (typeof rate !== 'number') {
      throw new Error('Invalid FX rate data');
    }
    fxRateCache.set(cacheKey, { rate, ts: Date.now() });
    return rate;
  })().finally(() => {
    fxRateRequests.delete(cacheKey);
  });

  fxRateRequests.set(cacheKey, promise);
  return promise;
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
): Promise<number> {
  const rate = await getFxRate(from, to);
  return amount * rate;
}

export function formatCurrency(amount: number, currency: string, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function clearFxRateCache(): void {
  fxRateCache.clear();
}
