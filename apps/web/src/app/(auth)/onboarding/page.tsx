'use client';
import { useEffect } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseClient';

export default function Onboarding() {
  const router = useRouter();
  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      if (user) router.replace('/');
    });
  }, [router]);

  async function signIn() {
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <button onClick={signIn} className="rounded bg-black text-white px-4 py-2">Sign in with Google</button>
    </main>
  );
}
