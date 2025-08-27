"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === "/";
    if (!user && !isAuthPage) {
      router.push("/");
    } else if (user && isAuthPage) {
      router.push("/dashboard");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const isAuthPage = pathname === "/";
  // If the user is not logged in and not on the auth page, don't render anything until redirect happens.
  if (!user && !isAuthPage) {
    return null;
  }
  // If the user is logged in and on the auth page, don't render anything until redirect happens.
  if (user && isAuthPage) {
      return null;
  }

  // A 404 might occur if the user was on a page that no longer exists (e.g., /shifts)
  // and the browser tries to navigate back. If the user is logged in but not on the auth page,
  // we render the children, letting Next.js handle the valid routes.
  if(user && !isAuthPage) {
    return (
      <AuthContext.Provider value={{ user }}>
          {children}
      </AuthContext.Provider>
    );
  }
  
  // Render login page for unauthenticated users
  if(!user && isAuthPage){
     return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
  }

  return null;
}
