/**
 * Cancel → waitlist / open-slot stub (mock localStorage).
 */

export type WaitlistEntry = {
  id: string;
  bookingId: string;
  serviceId: string;
  serviceName: string;
  scheduledAt: string;
  address: string;
  customerNote?: string;
  createdAt: string;
  status: "waiting" | "notified" | "filled";
};

const KEY = "pmb_waitlist";

function readAll(): WaitlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WaitlistEntry[];
  } catch {
    return [];
  }
}

function writeAll(list: WaitlistEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function joinWaitlist(input: {
  bookingId: string;
  serviceId: string;
  serviceName: string;
  scheduledAt: string;
  address: string;
  customerNote?: string;
}): WaitlistEntry {
  const entry: WaitlistEntry = {
    id: `wl_${Date.now().toString(36)}`,
    ...input,
    createdAt: new Date().toISOString(),
    status: "waiting",
  };
  const list = readAll().filter((e) => e.bookingId !== input.bookingId);
  list.unshift(entry);
  writeAll(list);
  return entry;
}

export function listWaitlist(): WaitlistEntry[] {
  return readAll();
}

/** Mock “blast” — mark waiting entries notified. */
export function mockBlastWaitlist(): number {
  const list = readAll().map((e) =>
    e.status === "waiting" ? { ...e, status: "notified" as const } : e
  );
  writeAll(list);
  return list.filter((e) => e.status === "notified").length;
}
