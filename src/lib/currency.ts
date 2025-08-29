import { z } from 'zod';

const currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/);

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  let res: Response;
  try {
    res = await fetch(
      `https://api.exchangerate.host/latest?base=${fromCode}&symbols=${toCode}`,
      { signal: controller.signal },
    );
  } catch (err) {
    if (controller.signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
      throw new Error('FX rate request timed out after 5s');
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
  return rate;
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
): Promise<number> {
  try {
    const rate = await getFxRate(from, to);
    return amount * rate;
  } catch (err) {
    console.error('Currency conversion failed', err);
    return amount;
  }
}

export function formatCurrency(amount: number, currency: string, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
