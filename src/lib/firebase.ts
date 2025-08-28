import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { z } from "zod";

const nonPlaceholder = z
  .string()
  .min(1)
  .refine(
    (v) => v !== "REPLACE_WITH_VALUE",
    "Set this Firebase env var in .env.local",
  );

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: nonPlaceholder,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: nonPlaceholder,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: nonPlaceholder,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: nonPlaceholder,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: nonPlaceholder,
  NEXT_PUBLIC_FIREBASE_APP_ID: nonPlaceholder,
});

const env = envSchema.parse(process.env);

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

