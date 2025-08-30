// Environment variables are provided by Next.js (e.g., via .env.local) at build time.

import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseOptions,
} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
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

type FirebaseServices = {
  app: ReturnType<typeof initializeApp>;
  auth: ReturnType<typeof getAuth>;
  db: ReturnType<typeof getFirestore>;
  categoriesCollection: ReturnType<typeof collection>;
};

let services: FirebaseServices | null = null;

// A function to check if all required environment variables are present.
// This provides a clearer error message than the generic Firebase error.
function validateFirebaseConfig(config: FirebaseOptions): void {
  const requiredKeys: (keyof FirebaseOptions)[] = [
    "apiKey",
    "authDomain",
    "projectId",
  ];
  for (const key of requiredKeys) {
    if (!config[key] || config[key] === "YOUR_API_KEY_HERE") {
      const envVarName = `NEXT_PUBLIC_FIREBASE_${key
        .replace(/([A-Z])/g, "_$1")
        .toUpperCase()}`;
      throw new Error(
        `Firebase configuration error: Missing or invalid value for ${key}. Please check your .env file for the ${envVarName} variable.`
      );
    }
  }
}

export function getFirebase(): FirebaseServices {
  if (services) {
    return services;
  }
  const env = envSchema.parse(process.env);
  const firebaseConfig: FirebaseOptions = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  validateFirebaseConfig(firebaseConfig);
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const categoriesCollection = collection(db, "categories");
  services = { app, auth, db, categoriesCollection };
  return services;
}


