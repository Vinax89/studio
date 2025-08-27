import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkQ_CcJgWzojHkPOA-2hbO6zD_EH39CuY",
  authDomain: "nursefinai.firebaseapp.com",
  projectId: "nursefinai",
  storageBucket: "nursefinai.appspot.com",
  messagingSenderId: "18157000551",
  appId: "1:18157000551:web:a565b5d1ff4537deb141c2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
