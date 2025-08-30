"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  startTransition,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebase } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { z } from "zod";

const { auth } = getFirebase();

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Attempts to restore a previously signed-in user directly from
  // Firebase's localStorage entry. The SDK stores authenticated users under
  // a key that includes the app's API key and name, allowing us to read it
  // synchronously before the auth listener fires on the client.
  const getPersistedUser = (): User | null => {
    if (typeof window === "undefined") return null;
    try {
      const key = `firebase:authUser:${auth.app.options.apiKey}:${auth.app.name}`;
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      const userSchema = z.object({ uid: z.string() }).passthrough();
      const result = userSchema.safeParse(parsed);
      return result.success ? (result.data as User) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState<User | null>(() => auth.currentUser ?? getPersistedUser());
  const router = useRouter();
  const pathname = usePathname();

  // Keep the `user` state in sync with Firebase auth changes. This runs once
  // on mount and updates whenever the user's sign-in state changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Redirect users based on their auth status. Using `startTransition` marks
  // the navigation as low priority so UI updates remain responsive while
  // redirects occur.
  useEffect(() => {
    const isAuthPage = pathname === "/";
    startTransition(() => {
      if (!user && !isAuthPage) {
        router.push("/");
      } else if (user && isAuthPage) {
        router.push("/dashboard");
      }
    });
  }, [user, router, pathname]);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
