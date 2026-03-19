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

export function toggleSession(sessionId: string): ProgressMap {
  const map = loadProgress();
  const current = map[sessionId];
  if (current?.done) {
    // Toggling off — clear the whole entry
    map[sessionId] = { done: false };
  } else {
    map[sessionId] = { ...current, done: true };
  }
  saveProgress(map);
  return { ...map };
}

export function saveEntry(
  sessionId: string,
  rpe: number,
  note: string
): ProgressMap {
  const map = loadProgress();
  map[sessionId] = { ...map[sessionId], done: true, rpe, note };
  saveProgress(map);
  return { ...map };
}

export function getEntry(
  sessionId: string,
  map: ProgressMap
): SessionEntry | undefined {
  return map[sessionId];
}
