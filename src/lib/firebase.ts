import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function getFirebaseConfig() {
  return {
    apiKey: getEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: getEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: getEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: getEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: getEnvVar("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: getEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID"),
  };
}

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
