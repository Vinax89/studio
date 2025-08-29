import { config } from "dotenv";
config();

import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseOptions,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  collection,
  type Firestore,
  type CollectionReference,
} from "firebase/firestore";
import { z } from "zod";

// A zod schema that validates that env vars are non-empty and not placeholders
const nonPlaceholder = z
  .string()
  .min(1)
  .refine((v) => v !== "REPLACE_WITH_VALUE", "Set this Firebase env var in .env.local");

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: nonPlaceholder,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: nonPlaceholder,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: nonPlaceholder,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: nonPlaceholder,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: nonPlaceholder,
  NEXT_PUBLIC_FIREBASE_APP_ID: nonPlaceholder,
});

// Check if all required env vars are present before attempting validation/initialization
const requiredKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

function hasRequiredEnv() {
  return requiredKeys.every((k) => {
    const val = process.env[k];
    return typeof val === "string" && val.length > 0 && val !== "REPLACE_WITH_VALUE";
  });
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let categoriesCollection: CollectionReference | undefined;
let firebaseReady = false;

if (hasRequiredEnv()) {
  const env = envSchema.parse(process.env);

  const firebaseConfig: FirebaseOptions = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // A function to check if all required environment variables are present.
  // This provides a clearer error message than the generic Firebase error.
  function validateFirebaseConfig(config: FirebaseOptions): void {
    const req: (keyof FirebaseOptions)[] = ["apiKey", "authDomain", "projectId"];
    for (const key of req) {
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

  // Validate and initialize Firebase
  validateFirebaseConfig(firebaseConfig);
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  categoriesCollection = collection(db, "categories");
  firebaseReady = true;
} else {
  // Export no-op stubs so modules depending on Firebase can operate in a limited fashion
  app = undefined;
  auth = undefined;
  db = undefined;
  categoriesCollection = undefined;
}

export { app, auth, db, categoriesCollection, firebaseReady };

