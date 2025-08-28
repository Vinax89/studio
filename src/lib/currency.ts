import { z } from 'zod';

const CurrencyCode = z.string().regex(/^[A-Z]{3}$/);

function parseCurrency(code: string): string {
  try {
    return CurrencyCode.parse(code.trim().toUpperCase());
  } catch {
    throw new Error(`Invalid currency code: ${code}`);
  }
}

export async function getFxRate(from: string, to: string): Promise<number> {
  const fromCode = parseCurrency(from);
  const toCode = parseCurrency(to);
  if (fromCode === toCode) return 1;
  let res: Response;
  try {
    res = await fetch(
      `https://api.exchangerate.host/latest?base=${fromCode}&symbols=${toCode}`,
    );
  } catch (err) {
    throw new Error(
      `Network error while fetching FX rates: ${
        err instanceof Error ? err.message : err
      }`,
    );
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
