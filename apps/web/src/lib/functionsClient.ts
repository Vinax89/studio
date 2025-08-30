'use client';
import { auth, FUNCTIONS_ORIGIN } from '@/lib/firebaseClient';

async function getIdToken(): Promise<string> { const u = auth.currentUser; if (!u) throw new Error('Not authenticated'); return u.getIdToken(true); }
async function authedFetch<T=any>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  const url = path.startsWith('http') ? path : `${FUNCTIONS_ORIGIN}${path.startsWith('/')?'':'/'}${path}`;
  const res = await fetch(url, { method: init.method ?? 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}`, ...(init.headers||{}) }, body: init.body ?? JSON.stringify({}) });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const ct = res.headers.get('content-type')||''; return ct.includes('application/json')? await res.json() : (await res.text() as any);
}
export const apiCreateLinkToken = () => authedFetch('/createLinkToken');
export const apiExchangePublicToken = (public_token: string) => authedFetch('/exchangePublicToken', { body: JSON.stringify({ public_token }) });
export const apiSyncItemNow = (item_id: string) => authedFetch(`/syncItemNow?item_id=${encodeURIComponent(item_id)}`, { method: 'POST' });
