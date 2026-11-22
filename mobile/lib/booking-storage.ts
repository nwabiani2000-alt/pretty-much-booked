export type TrackingStatus =
  | 'pending'
  | 'confirmed'
  | 'on_the_way'
  | 'in_progress'
  | 'completed';

export type MatchMode = 'pick' | 'match';

export type StoredBooking = {
  id: string;
  proId: string;
  serviceId: string;
  proName: string;
  proInitials?: string;
  proPhone?: string;
  serviceName: string;
  serviceCategory?: string;
  scheduledAt: string;
  address: string;
  notes?: string | null;
  styleNotes?: string | null;
  inspirationLabels?: string[];
  isEmergency: boolean;
  matchMode?: MatchMode;
  travelZone?: string;
  travelFee?: number;
  tipAmount?: number;
  prepAcknowledged?: boolean;
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
  });
}

/** In-memory store (session). Enough for mobile shell + web preview. */
const store = new Map<string, StoredBooking>();

export function saveBooking(booking: StoredBooking): void {
  store.set(booking.id, booking);
}

export function loadBooking(bookingId: string): StoredBooking | null {
  return store.get(bookingId) ?? null;
}

export function listBookings(): StoredBooking[] {
  return [...store.values()].sort((a, b) =>
    b.scheduledAt.localeCompare(a.scheduledAt)
  );
}

export function markDepositPaid(bookingId: string): StoredBooking | null {
  const booking = loadBooking(bookingId);
  if (!booking) return null;
  const next: StoredBooking = {
    ...booking,
    depositPaid: true,
    trackingStatus: booking.trackingStatus ?? 'pending',
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
      trackingStatus === 'confirmed' && !booking.confirmedAt
        ? new Date().toISOString()
        : booking.confirmedAt,
  };
  saveBooking(next);
  return next;
}

export const TRACKING_STATUSES: { id: TrackingStatus; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'on_the_way', label: 'On the Way' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

export const TIMELINE_STEPS = [
  'Booked',
  'Pro Confirms',
  'On The Way',
  'Service',
  'Done',
] as const;

export function timelineIndex(status: TrackingStatus): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'confirmed':
      return 1;
    case 'on_the_way':
      return 2;
    case 'in_progress':
      return 3;
    case 'completed':
      return 4;
  }
}

export const DEMO_BOOKING_ID = 'bk_demo_track';

export function ensureDemoBooking(
  id: string = DEMO_BOOKING_ID
): StoredBooking {
  const existing = loadBooking(id);
  if (existing) return existing;
  const when = new Date();
  when.setHours(when.getHours() + 2, 0, 0, 0);
  const booking: StoredBooking = {
    id,
    proId: '1',
    serviceId: 'box-braids',
    proName: 'Aisha B.',
    proInitials: 'AB',
    proPhone: '+44 7700 90001',
    serviceName: 'Box Braids',
    scheduledAt: when.toISOString(),
    address: '42 Curtain Road, Shoreditch, London EC2A 3NH',
    notes: null,
    isEmergency: false,
    servicePrice: 85,
    emergencyFee: 0,
    durationMins: 180,
    totalPrice: 85,
    depositAmount: 25.5,
    depositPaid: true,
    trackingStatus: 'pending',
  };
  saveBooking(booking);
  return booking;
}
