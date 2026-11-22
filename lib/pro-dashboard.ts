export type ProBookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "on_the_way"
  | "completed";

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
  whenLabel: "today" | "upcoming";
};

export type ProEarnings = {
  week: number;
  total: number;
  completedThisWeek: number;
};

export type ProAvailabilityState = {
  availableNow: boolean;
  weekdayHours: string;
  weekendHours: string;
};

const BOOKINGS_KEY = "pmb_pro_bookings";
const AVAIL_KEY = "pmb_pro_availability";

const SEED_BOOKINGS: ProBooking[] = [
  {
    id: "pb_1",
    customerName: "Maya K.",
    serviceName: "Box Braids",
    scheduledAt: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    address: "12 Rivington St, London",
    price: 85,
    deposit: 25.5,
    isEmergency: false,
    status: "pending",
    whenLabel: "today",
  },
  {
    id: "pb_2",
    customerName: "Jordan L.",
    serviceName: "Silk Press",
    scheduledAt: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(),
    address: "88 Curtain Rd, London",
    price: 65,
    deposit: 19.5,
    isEmergency: true,
    status: "accepted",
    whenLabel: "today",
  },
  {
    id: "pb_3",
    customerName: "Priya S.",
    serviceName: "Gel Manicure",
    scheduledAt: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(11, 0, 0, 0);
      return d.toISOString();
    })(),
    address: "5 Hoxton Sq, London",
    price: 45,
    deposit: 13.5,
    isEmergency: false,
    status: "accepted",
    whenLabel: "upcoming",
  },
  {
    id: "pb_4",
    customerName: "Chris W.",
    serviceName: "Fade / Haircut",
    scheduledAt: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      d.setHours(16, 0, 0, 0);
      return d.toISOString();
    })(),
    address: "3 Brick Ln, London",
    price: 35,
    deposit: 10.5,
    isEmergency: false,
    status: "pending",
    whenLabel: "upcoming",
  },
];

const DEFAULT_AVAIL: ProAvailabilityState = {
  availableNow: true,
  weekdayHours: "9:00 – 20:00",
  weekendHours: "10:00 – 18:00",
};

export function loadProBookings(): ProBooking[] {
  if (typeof window === "undefined") return SEED_BOOKINGS;
  try {
    const raw = sessionStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      sessionStorage.setItem(BOOKINGS_KEY, JSON.stringify(SEED_BOOKINGS));
      return SEED_BOOKINGS.map((b) => ({ ...b }));
    }
    return JSON.parse(raw) as ProBooking[];
  } catch {
    return SEED_BOOKINGS.map((b) => ({ ...b }));
  }
}

export function saveProBookings(bookings: ProBooking[]): void {
  sessionStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function getProBooking(id: string): ProBooking | undefined {
  return loadProBookings().find((b) => b.id === id);
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
  if (typeof window === "undefined") return { ...DEFAULT_AVAIL };
  try {
    const raw = sessionStorage.getItem(AVAIL_KEY);
    if (!raw) return { ...DEFAULT_AVAIL };
    return { ...DEFAULT_AVAIL, ...(JSON.parse(raw) as ProAvailabilityState) };
  } catch {
    return { ...DEFAULT_AVAIL };
  }
}

export function saveAvailability(state: ProAvailabilityState): void {
  sessionStorage.setItem(AVAIL_KEY, JSON.stringify(state));
}

export function computeEarnings(bookings: ProBooking[]): ProEarnings {
  /** Mock: 85% of accepted/on-the-way/completed counts toward earnings. */
  const active = bookings.filter(
    (b) =>
      b.status === "accepted" ||
      b.status === "on_the_way" ||
      b.status === "completed"
  );
  const weekRaw = active.reduce((sum, b) => sum + b.price * 0.85, 0);
  const week = Math.round(weekRaw * 100) / 100;
  const priorTotal = 420;
  return {
    week,
    total: Math.round((priorTotal + week) * 100) / 100,
    completedThisWeek: active.length,
  };
}

export function formatBookingWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const same =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  });
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
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${WEEKDAYS[d.getDay()]} · ${time}`;
}

export function statusLabel(status: ProBookingStatus): string {
  switch (status) {
    case "pending":
      return "Needs reply";
    case "accepted":
      return "Booked";
    case "declined":
      return "Declined";
    case "on_the_way":
      return "On the way";
    case "completed":
      return "Done";
  }
}
