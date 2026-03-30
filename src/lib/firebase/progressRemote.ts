import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { ProgressMap } from "@/lib/progress";
import { getFirestoreDb } from "./client";

function progressDocRef(uid: string) {
  const db = getFirestoreDb();
  if (!db) throw new Error("Firestore not initialized");
  return doc(db, "users", uid, "data", "progress");
}

/**
 * First load: if Firestore is empty but localStorage has rows, upload local;
 * if Firestore has rows, treat it as source of truth and mirror to localStorage.
 */
export async function initialSyncProgress(
  uid: string,
  local: ProgressMap
): Promise<ProgressMap> {
  const db = getFirestoreDb();
  if (!db) return local;

  const ref = progressDocRef(uid);
  const snap = await getDoc(ref);
  const serverSessions = (snap.data()?.sessions ?? {}) as ProgressMap;
  const hasServer =
    snap.exists() && Object.keys(serverSessions).length > 0;
  const hasLocal = Object.keys(local).length > 0;

  if (!hasServer && hasLocal) {
    await setDoc(ref, {
      sessions: local,
      updatedAt: serverTimestamp(),
    });
    return local;
  }

  if (hasServer) {
    return serverSessions;
  }

  return local;
}

export async function persistProgressRemote(
  uid: string,
  map: ProgressMap
): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  const ref = progressDocRef(uid);
  await setDoc(
    ref,
    { sessions: map, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export function subscribeProgressRemote(
  uid: string,
  onChange: (map: ProgressMap) => void
): () => void {
  const db = getFirestoreDb();
  if (!db) return () => {};

  const ref = progressDocRef(uid);
  return onSnapshot(ref, (snap) => {
    const sessions = snap.data()?.sessions as ProgressMap | undefined;
    if (sessions && typeof sessions === "object") {
      onChange(sessions);
    }
  });
}
