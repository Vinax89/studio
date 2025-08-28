type CacheEntry = { rate: number; expiry: number };

const fxCache = new Map<string, CacheEntry>();

let CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function setFxCacheTTL(ttlMs: number) {
  CACHE_TTL_MS = ttlMs;
}

export function __clearFxCache() {
  fxCache.clear();
}

function cacheKey(from: string, to: string): string {
  return `${from}-${to}`;
}

function getCachedRate(from: string, to: string): number | undefined {
  const entry = fxCache.get(cacheKey(from, to));
  if (entry && entry.expiry > Date.now()) {
    return entry.rate;
  }
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
    }
  }
  throw lastError;
}

export async function getFxRate(from: string, to: string, retries = 3): Promise<number> {
  if (from === to) return 1;
  const key = cacheKey(from, to);
  try {
    const res = await fetchWithRetry(
      `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`,
      retries,
    );
    const data = await res.json();
    const rate = data?.rates?.[to];
    if (typeof rate !== 'number') {
      throw new Error('Invalid FX rate data');
    }
    fxCache.set(key, { rate, expiry: Date.now() + CACHE_TTL_MS });
    return rate;
  } catch (err: any) {
    const cached = fxCache.get(key);
    if (cached) {
      console.warn(
        `Using cached FX rate for ${key} due to error: ${err?.message || err}`,
      );
      return cached.rate;
    }
    throw new Error(
      `Failed to fetch FX rate for ${from} -> ${to}: ${err?.message || err}`,
    );
  }
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
): Promise<number> {
  if (from === to) return amount;
  const cached = getCachedRate(from, to);
  const rate = typeof cached === 'number' ? cached : await getFxRate(from, to);
  return amount * rate;
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
