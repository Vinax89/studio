'use client';

import { auth, FUNCTIONS_ORIGIN } from '@/app/src/lib/firebaseClient';

async function idToken(): Promise<string> {
  const u = auth.currentUser;
  if (!u) throw new Error('Not authenticated');
  return u.getIdToken(true);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function functionsClient<T = unknown>(
  endpoint: string,
  { method, body }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${await idToken()}`,
  };

  const init: RequestInit = {
    method: method ?? 'GET',
    headers,
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${FUNCTIONS_ORIGIN}/${endpoint}`, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
