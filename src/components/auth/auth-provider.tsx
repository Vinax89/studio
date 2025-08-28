"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  startTransition,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { z } from "zod";

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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

  const [user, setUser] = useState<User | null>(
    () => auth.currentUser ?? getPersistedUser(),
  );
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

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
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}
