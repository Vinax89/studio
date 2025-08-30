'use client';
import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { callFunction } from '@/lib/functionsClient';

export default function LinkPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    callFunction('createLinkToken', { method: 'POST' }).then((r: any) => setToken(r.link_token));
  }, []);

  const { open, ready } = usePlaidLink({
    token: token || '',
    onSuccess: async (public_token) => {
      await callFunction('exchangePublicToken', {
        method: 'POST',
        body: JSON.stringify({ public_token }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Link an account</h1>
      <button onClick={() => open()} disabled={!ready} className="rounded bg-black text-white px-4 py-2">Connect bank</button>
    </main>
  );
}
