'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaidLink } from 'react-plaid-link';
import { apiCreateLinkToken, apiExchangePublicToken } from '@/lib/functionsClient';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

export default function LinkPage(){
  const router = useRouter();
  const [linkToken,setLinkToken]=useState<string|null>(null); const [error,setError]=useState<string|null>(null); const [status,setStatus]=useState('Initializing…'); const [authed,setAuthed]=useState(false);
  useEffect(()=> onAuthStateChanged(auth, async u=>{ setAuthed(!!u); if(!u) return; try{ setStatus('Requesting link token…'); const { link_token } = await apiCreateLinkToken(); setLinkToken(link_token); setStatus('Link token ready'); } catch(e:any){ setError(e.message);} }),[]);
  const { open, ready } = usePlaidLink({ token: linkToken ?? '', onSuccess: async (public_token)=>{ try{ setStatus('Exchanging public token…'); await apiExchangePublicToken(public_token); setStatus('Linked! Redirecting…'); router.replace('/transactions'); } catch(e:any){ setError(e.message);} }, onExit: (err)=>{ if(err) setError(err.display_message || err.error_message || 'Link exited'); } });
  useEffect(()=>{ if(linkToken && ready) open(); },[linkToken,ready,open]);
  if(!authed) return <div className="p-6"><p>Please sign in.</p></div>;
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Link a bank account</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-sm opacity-70">{status}</p>
      <button onClick={()=> (linkToken? open(): null)} disabled={!linkToken||!ready} className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-60">{ready?'Open Plaid Link':'Preparing…'}</button>
    </div>
  );
}
