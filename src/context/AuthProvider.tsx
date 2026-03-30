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
import { getFirebaseAuth, initFirebaseClient } from "@/lib/firebase/client";
import {
  signInWithEmail as loginEmail,
  signUpWithEmail as registerEmail,
  signInWithGoogle as loginGoogle,
  resetPassword as resetPw,
  signOut as fbSignOut,
} from "@/lib/firebase/authActions";

type AuthContextValue = {
  user: User | null;
  /** True until bootstrap fetch + first auth snapshot (or failure). */
  loading: boolean;
  /** Firebase SDK initialized with config from the server. */
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
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);
  const [missingFirebaseEnvVars, setMissingFirebaseEnvVars] = useState<
    string[]
  >([]);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    async function bootstrap() {
      try {
        const res = await fetch("/api/firebase-config", { cache: "no-store" });
        const data: unknown = await res.json();

        if (!res.ok || !data || typeof data !== "object") {
          const missing =
            data &&
            typeof data === "object" &&
            "missing" in data &&
            Array.isArray((data as { missing: unknown }).missing)
              ? ((data as { missing: string[] }).missing)
              : ["Could not load Firebase config from server"];
          setFirebaseConfigured(false);
          setMissingFirebaseEnvVars(missing);
          setLoading(false);
          return;
        }

        const cfg = data as Record<string, string | undefined>;
        if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId) {
          setFirebaseConfigured(false);
          setMissingFirebaseEnvVars([
            "Invalid config response (apiKey, authDomain, projectId required)",
          ]);
          setLoading(false);
          return;
        }

        initFirebaseClient({
          apiKey: cfg.apiKey,
          authDomain: cfg.authDomain,
          projectId: cfg.projectId,
          storageBucket: cfg.storageBucket,
          messagingSenderId: cfg.messagingSenderId,
          appId: cfg.appId,
        });

        setFirebaseConfigured(true);
        setMissingFirebaseEnvVars([]);

        const auth = getFirebaseAuth();
        if (!auth) {
          setLoading(false);
          return;
        }

        unsub = onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
        });
      } catch {
        setFirebaseConfigured(false);
        setMissingFirebaseEnvVars([
          "Network error loading /api/firebase-config",
        ]);
        setLoading(false);
      }
    }

    void bootstrap();
    return () => unsub?.();
  }, []);

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
