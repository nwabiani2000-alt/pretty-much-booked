export type TrackingStatus =
  | "pending"
  | "confirmed"
  | "on_the_way"
  | "in_progress"
  | "completed";

import type { TravelZoneId } from "@/lib/travel-zones";

export type MatchMode = "pick" | "match";

export type StoredBooking = {
  id: string;
  proId: string;
  serviceId: string;
  proName: string;
  proInitials?: string;
  proAvatarTone?: string;
  proPhone?: string;
  serviceName: string;
  serviceIcon?: string;
  serviceCategory?: string;
  scheduledAt: string;
  address: string;
  notes?: string | null;
  /** Style notes for the pro */
  styleNotes?: string | null;
  /** Mock inspiration image data URLs or labels */
  inspirationLabels?: string[];
  isEmergency: boolean;
  matchMode?: MatchMode;
  travelZone?: TravelZoneId;
  travelFee?: number;
  tipAmount?: number;
  prepAcknowledged?: boolean;
  /** Group booking */
  guestCount?: number;
  guestNames?: string[];
  /** Lagos escrow hold */
  escrow?: boolean;
  escrowStatus?: "none" | "held" | "released" | "refunded";
  /** Consultation answers */
  consultAnswers?: Record<string, string>;
  /** PMB Club discount applied (GBP) */
  clubDiscountGbp?: number;
  servicePrice: number;
  emergencyFee: number;
  durationMins: number;
  totalPrice: number;
  depositAmount: number;
  depositPaid?: boolean;
  trackingStatus?: TrackingStatus;
  confirmedAt?: string;
  cancelledAt?: string;
  waitlistJoined?: boolean;
};

const keyFor = (bookingId: string) => `pmb_booking_${bookingId}`;

export function saveBooking(booking: StoredBooking): void {
  sessionStorage.setItem(keyFor(booking.id), JSON.stringify(booking));
}

export function loadBooking(bookingId: string): StoredBooking | null {
  try {
    const raw = sessionStorage.getItem(keyFor(bookingId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredBooking;
  } catch {
    return null;
  }
}

export function markDepositPaid(bookingId: string): StoredBooking | null {
  const booking = loadBooking(bookingId);
  if (!booking) return null;
  const next: StoredBooking = {
    ...booking,
    depositPaid: true,
    trackingStatus: booking.trackingStatus ?? "pending",
  };
  saveBooking(next);
  return next;
}

export function setTrackingStatus(
  bookingId: string,
  trackingStatus: TrackingStatus
): StoredBooking | null {
  const booking = loadBooking(bookingId);
  if (!booking) return null;
  const next: StoredBooking = {
    ...booking,
    trackingStatus,
    confirmedAt:
      trackingStatus === "confirmed" && !booking.confirmedAt
        ? new Date().toISOString()
        : booking.confirmedAt,
  };
  saveBooking(next);
  return next;
}

export function updateBooking(
  bookingId: string,
  partial: Partial<StoredBooking>
): StoredBooking | null {
  const booking = loadBooking(bookingId);
  if (!booking) return null;
  const next = { ...booking, ...partial };
  saveBooking(next);
  return next;
}

export function cancelBooking(bookingId: string): StoredBooking | null {
  return updateBooking(bookingId, {
    cancelledAt: new Date().toISOString(),
    trackingStatus: "pending",
  });
}

export const TRACKING_STATUSES: {
  id: TrackingStatus;
  label: string;
}[] = [
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "on_the_way", label: "On the Way" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

export const TIMELINE_STEPS = [
  "Booked",
  "Pro Confirms",
  "On The Way",
  "Service",
  "Done",
] as const;

export function timelineIndex(status: TrackingStatus): number {
  switch (status) {
    case "pending":
      return 0;
    case "confirmed":
      return 1;
    case "on_the_way":
      return 2;
    case "in_progress":
      return 3;
    case "completed":
      return 4;
  }
}
