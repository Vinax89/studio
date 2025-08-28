export async function getFxRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;
  const res = await fetch(`https://api.exchangerate.host/latest?base=${from}&symbols=${to}`);
  if (!res.ok) {
    throw new Error('Failed to fetch FX rates');
  }
  const data = await res.json();
  const rate = data?.rates?.[to];
  if (typeof rate !== 'number') {
    throw new Error('Invalid FX rate data');
  }
  return rate;
}

export async function convertCurrency(amount: number, from: string, to: string): Promise<number> {
  const rate = await getFxRate(from, to);
  return amount * rate;
}

export function formatCurrency(amount: number, currency: string, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
