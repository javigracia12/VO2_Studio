"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  loadProgress,
  saveProgress,
  toggleSessionInMap,
  saveEntryInMap,
  type ProgressMap,
  type SessionEntry,
} from "@/lib/progress";
import { useAuth } from "@/context/AuthProvider";
import {
  initialSyncProgress,
  persistProgressRemote,
  subscribeProgressRemote,
} from "@/lib/firebase/progressRemote";

type ProgressContextValue = {
  progress: ProgressMap;
  toggle: (sessionId: string) => void;
  isDone: (sessionId: string) => boolean;
  saveEntry: (sessionId: string, rpe: number, note: string) => void;
  getEntry: (sessionId: string) => SessionEntry | undefined;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, firebaseConfigured } = useAuth();
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const uidRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRemotePersist = useCallback((map: ProgressMap) => {
    const uid = uidRef.current;
    if (!uid) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void persistProgressRemote(uid, map).catch((e) => {
        console.error("[firebase] Failed to save progress", e);
      });
    }, 450);
  }, []);

  useEffect(() => {
    if (!firebaseConfigured || !user) {
      uidRef.current = null;
      return;
    }

    uidRef.current = user.uid;
    let unsubDoc: (() => void) | undefined;

    (async () => {
      try {
        const merged = await initialSyncProgress(user.uid, loadProgress());
        setProgress(merged);
        saveProgress(merged);
        unsubDoc = subscribeProgressRemote(user.uid, (remote) => {
          setProgress(remote);
          saveProgress(remote);
        });
      } catch (e) {
        console.error("[firebase] Progress sync failed", e);
      }
    })();

    return () => {
      unsubDoc?.();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user, firebaseConfigured]);

  const toggle = useCallback(
    (sessionId: string) => {
      setProgress((prev) => {
        const next = toggleSessionInMap(prev, sessionId);
        saveProgress(next);
        scheduleRemotePersist(next);
        return next;
      });
    },
    [scheduleRemotePersist]
  );

  const saveEntry = useCallback(
    (sessionId: string, rpe: number, note: string) => {
      setProgress((prev) => {
        const next = saveEntryInMap(prev, sessionId, rpe, note);
        saveProgress(next);
        scheduleRemotePersist(next);
        return next;
      });
    },
    [scheduleRemotePersist]
  );

  const isDone = useCallback(
    (sessionId: string) => !!progress[sessionId]?.done,
    [progress]
  );

  const getEntry = useCallback(
    (sessionId: string): SessionEntry | undefined => progress[sessionId],
    [progress]
  );

  const value = useMemo(
    () => ({
      progress,
      toggle,
      isDone,
      saveEntry,
      getEntry,
    }),
    [progress, toggle, isDone, saveEntry, getEntry]
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return ctx;
}
