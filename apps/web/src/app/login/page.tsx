'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseClient';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function LoginPage(){
  const r = useRouter();
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  useEffect(()=> onAuthStateChanged(auth, u=> { if (u) r.replace('/(auth)/onboarding'); }), [r]);
  async function submit(e: React.FormEvent){ e.preventDefault(); setBusy(true); setErr(''); try{ if(mode==='login') await signInWithEmailAndPassword(auth,email,password); else await createUserWithEmailAndPassword(auth,email,password);} catch(e:any){ setErr(e.message);} finally{ setBusy(false);} }
  async function google(){ setBusy(true); setErr(''); try{ await signInWithPopup(auth, new GoogleAuthProvider()); } catch(e:any){ setErr(e.message);} finally{ setBusy(false);} }
  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold">{mode==='login'?'Welcome back':'Create account'}</h1>
      <form onSubmit={submit} className="space-y-3 mt-4">
        <input className="w-full border rounded p-2" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={busy} className="w-full rounded bg-black text-white py-2">{busy?'Working…':(mode==='login'?'Log in':'Sign up')}</button>
        <button type="button" onClick={google} disabled={busy} className="w-full border rounded py-2">Continue with Google</button>
        <p className="text-sm text-center mt-2">{mode==='login' ? <>New here? <button type="button" className="underline" onClick={()=>setMode('signup')}>Create account</button></> : <>Have an account? <button type="button" className="underline" onClick={()=>setMode('login')}>Log in</button></>}</p>
      </form>
    </div>
  );
}
