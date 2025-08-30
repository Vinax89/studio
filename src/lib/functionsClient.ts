'use client';
import { auth, FUNCTIONS_ORIGIN } from '@/lib/firebaseClient';

async function getIdToken(): Promise<string> {
  const u = auth.currentUser;
  if (!u) throw new Error('Not authenticated');
  return await u.getIdToken(true);
}

async function authedFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  const url = path.startsWith('http') ? path : `${FUNCTIONS_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, {
    method: init.method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(init.headers || {}),
    },
    body: init.body ?? JSON.stringify({}),
    credentials: 'omit',
    cache: 'no-store',
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? (await res.json()) as T : ((await res.text()) as unknown as T);
}

export async function apiCreateLinkToken(): Promise<{ link_token: string }> {
  return authedFetch('/createLinkToken');
}

export async function apiExchangePublicToken(public_token: string): Promise<{ item_id: string; accounts: number }> {
  return authedFetch('/exchangePublicToken', { body: JSON.stringify({ public_token }) });
}

export async function apiSyncItemNow(item_id: string): Promise<{ ok: boolean } | Record<string, unknown>> {
  return authedFetch(`/syncItemNow?item_id=${encodeURIComponent(item_id)}`, { method: 'POST' });
}
