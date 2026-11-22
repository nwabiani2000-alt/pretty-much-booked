export type ProBookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'on_the_way'
  | 'completed';

export type ProBooking = {
  id: string;
  customerName: string;
  serviceName: string;
  scheduledAt: string;
  address: string;
  price: number;
  deposit: number;
  isEmergency: boolean;
  status: ProBookingStatus;
  whenLabel: 'today' | 'upcoming';
};

export type ProEarnings = {
  week: number;
  total: number;
};

export type ProAvailabilityState = {
  availableNow: boolean;
  weekdayHours: string;
  weekendHours: string;
};

const BOOKINGS_KEY = 'pmb_pro_bookings';
const AVAIL_KEY = 'pmb_pro_availability';

const SEED_BOOKINGS: ProBooking[] = [
  {
    id: 'pb_1',
    customerName: 'Maya K.',
    serviceName: 'Box Braids',
    scheduledAt: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    address: '12 Rivington St, London',
    price: 85,
    deposit: 25.5,
    isEmergency: false,
    status: 'pending',
    whenLabel: 'today',
  },
  {
    id: 'pb_2',
    customerName: 'Jordan L.',
    serviceName: 'Silk Press',
    scheduledAt: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(),
    address: '88 Curtain Rd, London',
    price: 65,
    deposit: 19.5,
    isEmergency: true,
    status: 'accepted',
    whenLabel: 'today',
  },
  {
    id: 'pb_3',
    customerName: 'Priya S.',
    serviceName: 'Gel Manicure',
    scheduledAt: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(11, 0, 0, 0);
      return d.toISOString();
    })(),
    address: '5 Hoxton Sq, London',
    price: 45,
    deposit: 13.5,
    isEmergency: false,
    status: 'accepted',
    whenLabel: 'upcoming',
  },
  {
    id: 'pb_4',
    customerName: 'Chris W.',
    serviceName: 'Fade / Haircut',
    scheduledAt: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      d.setHours(16, 0, 0, 0);
      return d.toISOString();
    })(),
    address: '3 Brick Ln, London',
    price: 35,
    deposit: 10.5,
    isEmergency: false,
    status: 'pending',
    whenLabel: 'upcoming',
  },
];

const DEFAULT_AVAIL: ProAvailabilityState = {
  availableNow: true,
  weekdayHours: '9:00 – 20:00',
  weekendHours: '10:00 – 18:00',
};

let bookingsMem: ProBooking[] | null = null;
let availMem: ProAvailabilityState | null = null;

function ssGet(key: string): string | null {
  try {
    if (typeof sessionStorage !== 'undefined') return sessionStorage.getItem(key);
  } catch {
    /* ignore */
  }
  return null;
}

function ssSet(key: string, value: string): void {
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function loadProBookings(): ProBooking[] {
  if (bookingsMem) return bookingsMem.map((b) => ({ ...b }));
  try {
    const raw = ssGet(BOOKINGS_KEY);
    if (!raw) {
      bookingsMem = SEED_BOOKINGS.map((b) => ({ ...b }));
      ssSet(BOOKINGS_KEY, JSON.stringify(bookingsMem));
      return bookingsMem.map((b) => ({ ...b }));
    }
    bookingsMem = JSON.parse(raw) as ProBooking[];
    return bookingsMem.map((b) => ({ ...b }));
  } catch {
    bookingsMem = SEED_BOOKINGS.map((b) => ({ ...b }));
    return bookingsMem.map((b) => ({ ...b }));
  }
}

export function saveProBookings(bookings: ProBooking[]): void {
  bookingsMem = bookings;
  ssSet(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function setProBookingStatus(
  id: string,
  status: ProBookingStatus
): ProBooking | null {
  const list = loadProBookings();
  const idx = list.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], status };
  saveProBookings(list);
  return list[idx];
}

export function loadAvailability(): ProAvailabilityState {
  if (availMem) return { ...availMem };
  try {
    const raw = ssGet(AVAIL_KEY);
    if (!raw) {
      availMem = { ...DEFAULT_AVAIL };
      return { ...availMem };
    }
    availMem = { ...DEFAULT_AVAIL, ...(JSON.parse(raw) as ProAvailabilityState) };
    return { ...availMem };
  } catch {
    availMem = { ...DEFAULT_AVAIL };
    return { ...availMem };
  }
}

export function saveAvailability(state: ProAvailabilityState): void {
  availMem = state;
  ssSet(AVAIL_KEY, JSON.stringify(state));
}

export function computeEarnings(bookings: ProBooking[]): ProEarnings {
  const active = bookings.filter(
    (b) =>
      b.status === 'accepted' ||
      b.status === 'on_the_way' ||
      b.status === 'completed'
  );
  const week = Math.round(active.reduce((s, b) => s + b.price * 0.85, 0) * 100) / 100;
  return { week, total: Math.round((420 + week) * 100) / 100 };
}

export function formatBookingWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const same =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (same) return `Today · ${time}`;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  ) {
    return `Tomorrow · ${time}`;
  }
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${WEEKDAYS[d.getDay()]} · ${time}`;
}

export function statusLabel(status: ProBookingStatus): string {
  switch (status) {
    case 'pending':
      return 'Needs reply';
    case 'accepted':
      return 'Booked';
    case 'declined':
      return 'Declined';
    case 'on_the_way':
      return 'On the way';
    case 'completed':
      return 'Done';
  }
}
