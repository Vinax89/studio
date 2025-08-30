'use client';
import { auth, FUNCTIONS_ORIGIN } from '@/lib/firebase';

async function idToken(): Promise<string> { const u = auth.currentUser; if (!u) throw new Error('Not authenticated'); return u.getIdToken(true); }

export async function apiTaxSummary(year: number) {
  const res = await fetch(`${FUNCTIONS_ORIGIN}/taxYearSummary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await idToken()}` },
    body: JSON.stringify({ year }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function downloadTaxCsv(year: number) {
  const res = await fetch(`${FUNCTIONS_ORIGIN}/taxYearCsv?year=${year}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${await idToken()}` },
  });
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `nurse-tax-${year}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
