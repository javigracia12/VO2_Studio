const STORAGE_KEY = "riding-progress";

export type ProgressMap = Record<string, boolean>;

export function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
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
  map[sessionId] = !map[sessionId];
  saveProgress(map);
  return { ...map };
}

export function isSessionDone(
  sessionId: string,
  map?: ProgressMap
): boolean {
  const m = map ?? loadProgress();
  return !!m[sessionId];
}
