"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import auth from "@/configs/firebase";

interface AuthState {
  isLoggedIn: boolean;
  uid: string | null;
  user: User | null;
  loading: boolean;
}

export function useAuth(redirectTo: string = "/auth?mode=login"): AuthState {
  const [authState, setAuthState] = useState<Omit<AuthState, 'loading'>>({
    isLoggedIn: false,
    uid: null,
    user: null,
  });
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setAuthState({
          isLoggedIn: true,
          uid: user.uid,
          user: user
        });
      } else {
        setAuthState({
          isLoggedIn: false,
          uid: null,
          user: null
        });
        if (redirectTo && !loading) {
          router.push(redirectTo);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [redirectTo, router]);

  return { ...authState, loading };
}