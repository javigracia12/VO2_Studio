import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Read config at call time so Next.js can inline `NEXT_PUBLIC_*` into the client bundle.
 * (Top-level `const cfg = { apiKey: process.env... }` can be tree-shaken or stale in some setups.)
 *
 * Add to `.env.local` (local) or your host's env (production — then redeploy):
 * NEXT_PUBLIC_FIREBASE_API_KEY
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * NEXT_PUBLIC_FIREBASE_APP_ID
 */
export function getFirebaseWebConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

const REQUIRED_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
] as const;

export function getMissingFirebaseEnvVars(): string[] {
  const cfg = getFirebaseWebConfig();
  const missing: string[] = [];
  if (!cfg.apiKey?.trim()) missing.push(REQUIRED_KEYS[0]);
  if (!cfg.authDomain?.trim()) missing.push(REQUIRED_KEYS[1]);
  if (!cfg.projectId?.trim()) missing.push(REQUIRED_KEYS[2]);
  return missing;
}

export function isFirebaseConfigured(): boolean {
  return getMissingFirebaseEnvVars().length === 0;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  const cfg = getFirebaseWebConfig();
  if (!getApps().length) {
    return initializeApp({
      apiKey: cfg.apiKey!,
      authDomain: cfg.authDomain!,
      projectId: cfg.projectId!,
      storageBucket: cfg.storageBucket,
      messagingSenderId: cfg.messagingSenderId,
      appId: cfg.appId,
    });
  }
  return getApps()[0]!;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getFirestoreDb(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}
