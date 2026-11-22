/**
 * Push notifications stub — preference + mock send log.
 * FCM/APNs wiring is later; this only stores prefs + a local log.
 */

const PREF_KEY = "pmb_push_enabled";
const LOG_KEY = "pmb_push_log";

export type PushLogEntry = {
  id: string;
  title: string;
  body: string;
  at: string;
};

export function isPushEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PREF_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPushEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREF_KEY, on ? "1" : "0");
}

export function loadPushLog(): PushLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PushLogEntry[];
  } catch {
    return [];
  }
}

export function mockSendPush(title: string, body: string): PushLogEntry {
  const entry: PushLogEntry = {
    id: `push_${Date.now().toString(36)}`,
    title,
    body,
    at: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    const list = [entry, ...loadPushLog()].slice(0, 20);
    localStorage.setItem(LOG_KEY, JSON.stringify(list));
  }
  return entry;
}
