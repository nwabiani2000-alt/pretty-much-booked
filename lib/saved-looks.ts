/**
 * Saved look preferences / rebook same pro.
 */

export type SavedLook = {
  proId: string;
  proName: string;
  serviceId: string;
  serviceName: string;
  styleNotes?: string | null;
  inspirationLabels?: string[];
  savedAt: string;
};

const KEY = "pmb_saved_look";

export function saveLook(look: Omit<SavedLook, "savedAt">): SavedLook {
  const full: SavedLook = { ...look, savedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(full));
    } catch {
      /* ignore */
    }
  }
  return full;
}

export function loadSavedLook(): SavedLook | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedLook;
  } catch {
    return null;
  }
}

export function clearSavedLook(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
