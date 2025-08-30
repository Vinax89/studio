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

const firebaseConfigSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
});

let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let categoriesCollection: ReturnType<typeof collection>;


// A function to check if all required environment variables are present.
// This provides a clearer error message than the generic Firebase error.
function validateFirebaseConfig(config: FirebaseOptions): void {
  if (
    !config.apiKey ||
    !config.authDomain ||
    !config.projectId
  ) {
    throw new Error(
      `Firebase configuration error: Missing or invalid value for apiKey, authDomain, or projectId. Please check your .env.local file.`
    );
  }
}

export function initFirebase() {
  if (app) {
    return { app, auth, db, categoriesCollection };
  }
  const env = firebaseConfigSchema.parse(process.env);
  const firebaseConfig: FirebaseOptions = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  validateFirebaseConfig(firebaseConfig);
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  categoriesCollection = collection(db, "categories");
  return { app, auth, db, categoriesCollection };
}

export { app, auth, db, categoriesCollection };