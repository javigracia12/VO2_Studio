const STORAGE_KEY = "riding-progress";

export interface SessionEntry {
  done: boolean;
  rpe?: number;
  note?: string;
}

export type ProgressMap = Record<string, SessionEntry>;

export function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Migrate legacy boolean map to SessionEntry shape
    const result: ProgressMap = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (typeof val === "boolean") {
        result[key] = { done: val };
      } else {
        result[key] = val as SessionEntry;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function saveProgress(map: ProgressMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Pure update for React + cloud sync (does not read/write localStorage). */
export function toggleSessionInMap(
  map: ProgressMap,
  sessionId: string
): ProgressMap {
  const next: ProgressMap = { ...map };
  const current = next[sessionId];
  if (current?.done) {
    next[sessionId] = { done: false };
  } else {
    next[sessionId] = { ...current, done: true };
  }
  return next;
}

/** Pure update for React + cloud sync (does not read/write localStorage). */
export function saveEntryInMap(
  map: ProgressMap,
  sessionId: string,
  rpe: number,
  note: string
): ProgressMap {
  return {
    ...map,
    [sessionId]: { ...map[sessionId], done: true, rpe, note },
  };
}

export function toggleSession(sessionId: string): ProgressMap {
  const map = loadProgress();
  const next = toggleSessionInMap(map, sessionId);
  saveProgress(next);
  return next;
}

export function saveEntry(
  sessionId: string,
  rpe: number,
  note: string
): ProgressMap {
  const map = loadProgress();
  const next = saveEntryInMap(map, sessionId, rpe, note);
  saveProgress(next);
  return next;
}

export function getEntry(
  sessionId: string,
  map: ProgressMap
): SessionEntry | undefined {
  return map[sessionId];
}
