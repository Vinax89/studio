import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { z } from "zod";

const nonPlaceholder = z
  .string()
  .min(1)
  .refine(
    (v) => v !== "REPLACE_WITH_VALUE",
    "Set this Firebase env var in .env.local"
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

<<<<<<< HEAD
const firebaseConfig = {
<<<<<<< HEAD
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
=======
=======
const firebaseConfig: FirebaseOptions = {
>>>>>>> b8806e7 (I see this error with the app, reported by NextJS, please fix it. The er)
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
>>>>>>> d96745a (code review)
};

// A function to check if all required environment variables are present.
// This provides a clearer error message than the generic Firebase error.
function validateFirebaseConfig(config: FirebaseOptions): void {
  const requiredKeys: (keyof FirebaseOptions)[] = [
    'apiKey',
    'authDomain',
    'projectId',
  ];
  for (const key of requiredKeys) {
    if (!config[key] || config[key] === "YOUR_API_KEY") {
      const envVarName = `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
      throw new Error(`Firebase configuration error: Missing or invalid value for ${key}. Please check your .env file for the ${envVarName} variable.`);
    }
  }
}

// Validate the config before initializing
validateFirebaseConfig(firebaseConfig);

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
