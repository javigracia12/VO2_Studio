"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  getFirebaseAuth,
  getMissingFirebaseEnvVars,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import {
  signInWithEmail as loginEmail,
  signUpWithEmail as registerEmail,
  signInWithGoogle as loginGoogle,
  resetPassword as resetPw,
  signOut as fbSignOut,
} from "@/lib/firebase/authActions";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  firebaseConfigured: boolean;
  missingFirebaseEnvVars: string[];
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const PROGRESS_STORAGE_KEY = "riding-progress";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseConfigured = isFirebaseConfigured();
  const missingFirebaseEnvVars = getMissingFirebaseEnvVars();

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, [firebaseConfigured]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await loginEmail(email, password);
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    await registerEmail(email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await loginGoogle();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await resetPw(email);
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firebaseConfigured,
        missingFirebaseEnvVars,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
