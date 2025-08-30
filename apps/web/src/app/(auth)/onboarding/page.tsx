'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};

function useFirebase(): { app: FirebaseApp } {
  const app = useMemo(() => (getApps()[0] ?? initializeApp(firebaseConfig)), []);
  return { app };
}

type NurseRole = 'travel' | 'staff' | 'student';

export default function OnboardingPage() {
  const { app } = useFirebase();
  const auth = useMemo(() => getAuth(app), [app]);
  const db = useMemo(() => getFirestore(app), [app]);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState<NurseRole>('travel');
  const [specialty, setSpecialty] = useState('');
  const [homeState, setHomeState] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
      if (!u) router.replace('/login');
    });
    return () => unsub();
  }, [auth, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          user_id: user.uid,
          email: user.email ?? null,
          role,
          first_name: firstName || null,
          specialty: specialty || null,
          home_state: homeState || null,
          marketing_opt_in: marketingOptIn,
          created_at: serverTimestamp(),
          last_login: serverTimestamp()
        },
        { merge: true }
      );
      router.replace('/transactions');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingAuth) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <p className="text-sm opacity-70">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-1">Welcome! Let’s set up your profile.</h1>
      <p className="text-sm text-gray-500 mb-4">This helps tailor categories, budgets, and insights for nurses.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium">First name</label>
          <input className="mt-1 w-full rounded-lg border p-2" placeholder="Alex" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Role</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(['travel','staff','student'] as NurseRole[]).map((k) => (
              <button key={k} type="button" onClick={() => setRole(k)} className={`rounded-lg border p-2 text-sm ${role===k?'border-black ring-2 ring-black':'opacity-80'}`}>
                {k}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Specialty (optional)</label>
            <input className="mt-1 w-full rounded-lg border p-2" placeholder="ER, ICU, Med-Surg, OR…" value={specialty} onChange={(e)=>setSpecialty(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Home state (US)</label>
            <input className="mt-1 w-full rounded-lg border p-2" placeholder="CA" maxLength={2} value={homeState} onChange={(e)=>setHomeState(e.target.value.toUpperCase())} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={marketingOptIn} onChange={(e)=>setMarketingOptIn(e.target.checked)} /> Send product tips & beta invites</label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting} className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-60">{submitting?'Saving…':'Continue'}</button>
          <button type="button" onClick={()=>signOut(auth)} className="text-sm underline opacity-70">Sign out</button>
        </div>
      </form>
    </div>
  );
}
