
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

let app: ReturnType<typeof initializeApp> | undefined;
let auth!: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore> | undefined;
let categoriesCollection: ReturnType<typeof collection> | undefined;


export function initFirebase() {
  if (app) {
    return { app, auth, db: db!, categoriesCollection: categoriesCollection! };
  }

  const envParseResult = firebaseConfigSchema.safeParse(process.env);

  if (!envParseResult.success) {
    console.error("Firebase configuration error:", envParseResult.error.flatten().fieldErrors);
    throw new Error("Invalid Firebase configuration. Please check your environment variables.");
  }
  const env = envParseResult.data;

  const firebaseConfig: FirebaseOptions = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    categoriesCollection = collection(db, "categories");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw new Error("Failed to initialize Firebase");
  }
  return { app, auth, db, categoriesCollection };
}

export function getDb(): ReturnType<typeof getFirestore> {
  if (!db) {
    initFirebase();
  }
  return db!;
}

export { app, auth, db, categoriesCollection };
