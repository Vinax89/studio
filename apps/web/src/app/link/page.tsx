'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { createLinkToken, exchangePublicToken } from '@/lib/functionsClient';

export default function LinkPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    createLinkToken().then((res) => {
      const token = (res.data as any).link_token;
      setLinkToken(token);
    });
  }, []);

  const onSuccess = useCallback(async (public_token: string) => {
    await exchangePublicToken({ public_token });
  }, []);

  const { open, ready } = usePlaidLink({ token: linkToken ?? '', onSuccess });

  return (
    <main className="p-6">
      <button
        onClick={() => open()}
        disabled={!ready}
        className="rounded bg-black text-white px-4 py-2"
      >
        Link account
      </button>
    </main>
  );
}
