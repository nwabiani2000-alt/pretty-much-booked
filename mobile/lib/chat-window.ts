/**
 * Timed messaging window — unlock ~1h before appointment (Glamsquad-style).
 */

export const CHAT_UNLOCK_MINUTES_BEFORE = 60;

export type ChatWindowState =
  | { open: true; reason: "within_window" | "emergency" | "in_progress" }
  | {
      open: false;
      reason: "too_early" | "no_booking";
      opensAt?: string;
      minutesUntil?: number;
    };

export function chatWindowForBooking(opts: {
  scheduledAt?: string | null;
  trackingStatus?: string | null;
  isEmergency?: boolean;
  now?: Date;
}): ChatWindowState {
  const now = opts.now ?? new Date();
  if (!opts.scheduledAt) {
    return { open: false, reason: "no_booking" };
  }
  if (
    opts.isEmergency ||
    opts.trackingStatus === "on_the_way" ||
    opts.trackingStatus === "in_progress" ||
    opts.trackingStatus === "confirmed"
  ) {
    // Confirmed+ stays open once unlocked; emergency always open
    if (opts.isEmergency) {
      return { open: true, reason: "emergency" };
    }
  }

  const start = new Date(opts.scheduledAt).getTime();
  const unlockAt = start - CHAT_UNLOCK_MINUTES_BEFORE * 60 * 1000;
  const end = start + 4 * 60 * 60 * 1000; // 4h after start
  const t = now.getTime();

  if (t >= unlockAt && t <= end) {
    return { open: true, reason: "within_window" };
  }
  if (t < unlockAt) {
    return {
      open: false,
      reason: "too_early",
      opensAt: new Date(unlockAt).toISOString(),
      minutesUntil: Math.ceil((unlockAt - t) / 60000),
    };
  }
  // After window — still allow if in progress statuses
  if (
    opts.trackingStatus === "on_the_way" ||
    opts.trackingStatus === "in_progress"
  ) {
    return { open: true, reason: "in_progress" };
  }
  return {
    open: false,
    reason: "too_early",
    opensAt: new Date(unlockAt).toISOString(),
  };
}

export function formatOpensIn(minutesUntil: number): string {
  if (minutesUntil < 60) return `in ${minutesUntil} min`;
  const h = Math.floor(minutesUntil / 60);
  const m = minutesUntil % 60;
  return m ? `in ${h}h ${m}m` : `in ${h}h`;
}
