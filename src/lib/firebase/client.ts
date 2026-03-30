import {
  initializeApp,
  getApps,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let clientApp: FirebaseApp | null = null;

/**
 * Call once after loading config from `/api/firebase-config` (browser only).
 * Do not read `process.env` here — it is empty in many production client bundles.
 */
export function initFirebaseClient(options: FirebaseOptions): FirebaseApp {
  if (clientApp) return clientApp;
  if (getApps().length > 0) {
    clientApp = getApps()[0]!;
    return clientApp;
  }
  clientApp = initializeApp(options);
  return clientApp;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (clientApp) return clientApp;
  if (getApps().length > 0) {
    clientApp = getApps()[0]!;
    return clientApp;
  }
  return null;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getFirestoreDb(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}
