'use client';
import { useEffect } from 'react';
import { auth } from '@/lib/firebaseClient';
import { useRouter } from 'next/navigation';
import * as firebaseui from 'firebaseui';
import { EmailAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';

export default function OnboardingPage() {
  const router = useRouter();
  useEffect(() => {
    const ui =
      firebaseui.auth.AuthUI.getInstance() ||
      new firebaseui.auth.AuthUI(auth);
    ui.start('#firebaseui', {
      signInOptions: [
        GoogleAuthProvider.PROVIDER_ID,
        EmailAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        signInSuccessWithAuthResult: () => {
          router.push('/link');
          return false;
        },
      },
    });
  }, [router]);

  return <div id="firebaseui" />;
}
