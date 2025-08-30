import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let _app: FirebaseApp | null = null;
export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };
  _app = getApps()[0] ?? initializeApp(config); return _app;
}
export const app = getFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
export const FUNCTIONS_REGION = process.env.NEXT_PUBLIC_FUNCTIONS_REGION ?? 'us-central1';
export const FUNCTIONS_ORIGIN = process.env.NEXT_PUBLIC_FUNCTIONS_ORIGIN ?? `https://${FUNCTIONS_REGION}-${projectId}.cloudfunctions.net`;
