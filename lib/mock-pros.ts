import {
  DEFAULT_MARKET,
  formatMoneyGbp,
  readStoredMarket,
} from "@/lib/market";
import { MOCK_SERVICES } from "@/lib/services";
import type { Pro, Service } from "@/types/booking";

export type MockProListing = Pro & {
  reviews: number;
  distance_miles: number;
  next_available: string;
  is_available_now: boolean;
  /** serviceId → offering */
  offerings: Record<
    string,
    { price: number; duration_mins: number }
  >;
  initials: string;
  avatar_tone: string;
};

export const MOCK_PROS: MockProListing[] = [
  {
    id: "1",
    display_name: "Aisha B.",
    initials: "AB",
    avatar_tone: "from-[#EDE9FE] to-[#DDD6FE]",
    bio: "London-based braiding specialist. Neat parts, lasting styles, and calm chair-side energy.",
    specialties: ["Box Braids", "Silk Press"],
    rating: 4.9,
    pro_score: 98,
    reviews: 127,
    completed_bookings: 312,
    response_time_mins: 3,
    is_verified: true,
    is_available: true,
    is_available_now: true,
    distance_miles: 2.3,
    next_available: "Today 2:00 PM",
    portfolio_images: ["p1", "p2", "p3", "p4", "p5", "p6"],
    offerings: {
      "box-braids": { price: 85, duration_mins: 180 },
      "silk-press": { price: 65, duration_mins: 90 },
    },
  },
  {
    id: "2",
    display_name: "Nia O.",
    initials: "NO",
    avatar_tone: "from-[#D1FAE5] to-[#A7F3D0]",
    bio: "Protective styles with precision parting. Same-day slots when free.",
    specialties: ["Box Braids", "Gel Manicure"],
    rating: 4.8,
    pro_score: 99,
    reviews: 204,
    completed_bookings: 410,
    response_time_mins: 4,
    is_verified: true,
    is_available: true,
    is_available_now: true,
    distance_miles: 4.2,
    next_available: "Today 5:00 PM",
    portfolio_images: ["p1", "p2", "p3"],
    offerings: {
      "box-braids": { price: 110, duration_mins: 210 },
      "gel-manicure": { price: 48, duration_mins: 60 },
    },
  },
  {
    id: "3",
    display_name: "Keisha M.",
    initials: "KM",
    avatar_tone: "from-[#FEF3C7] to-[#FDE68A]",
    bio: "Soft glam to full glam. Events, shoots, and everyday polish.",
    specialties: ["Soft Glam Makeup", "Full Glam Makeup", "Classic Lashes"],
    rating: 4.95,
    pro_score: 96,
    reviews: 89,
    completed_bookings: 156,
    response_time_mins: 5,
    is_verified: true,
    is_available: true,
    is_available_now: false,
    distance_miles: 1.8,
    next_available: "Tomorrow 10:00 AM",
    portfolio_images: ["p1", "p2", "p3", "p4"],
    offerings: {
      "soft-glam-makeup": { price: 75, duration_mins: 60 },
      "full-glam-makeup": { price: 120, duration_mins: 90 },
      "classic-lashes": { price: 70, duration_mins: 90 },
    },
  },
  {
    id: "4",
    display_name: "Tunde A.",
    initials: "TA",
    avatar_tone: "from-[#DBEAFE] to-[#BFDBFE]",
    bio: "Clean fades and sharp line-ups. Mobile chair, London-wide.",
    specialties: ["Fade / Haircut", "Beard Trim"],
    rating: 4.7,
    pro_score: 88,
    reviews: 156,
    completed_bookings: 220,
    response_time_mins: 8,
    is_verified: true,
    is_available: true,
    is_available_now: true,
    distance_miles: 3.1,
    next_available: "Today 3:30 PM",
    portfolio_images: ["p1", "p2", "p3"],
    offerings: {
      "fade-haircut": { price: 35, duration_mins: 45 },
      "beard-trim": { price: 25, duration_mins: 30 },
    },
  },
  {
    id: "5",
    display_name: "Amara K.",
    initials: "AK",
    avatar_tone: "from-[#FCE7F3] to-[#FBCFE8]",
    bio: "Volume and classic lashes with a gentle touch. Patch-test friendly.",
    specialties: ["Classic Lashes", "Volume Lashes", "Acrylic Nails"],
    rating: 4.85,
    pro_score: 92,
    reviews: 143,
    completed_bookings: 198,
    response_time_mins: 6,
    is_verified: true,
    is_available: true,
    is_available_now: true,
    distance_miles: 2.9,
    next_available: "Today 4:00 PM",
    portfolio_images: ["p1", "p2", "p3", "p4", "p5"],
    offerings: {
      "classic-lashes": { price: 72, duration_mins: 90 },
      "volume-lashes": { price: 95, duration_mins: 120 },
      "acrylic-nails": { price: 68, duration_mins: 120 },
    },
  },
  {
    id: "6",
    display_name: "Jordan P.",
    initials: "JP",
    avatar_tone: "from-[#E0E7FF] to-[#C7D2FE]",
    bio: "Swedish and deep tissue — recovery-focused massage at your door.",
    specialties: ["Swedish Massage", "Deep Tissue Massage"],
    rating: 4.75,
    pro_score: 84,
    reviews: 67,
    completed_bookings: 95,
    response_time_mins: 10,
    is_verified: true,
    is_available: true,
    is_available_now: false,
    distance_miles: 5.4,
    next_available: "Tomorrow 1:00 PM",
    portfolio_images: ["p1", "p2", "p3"],
    offerings: {
      "swedish-massage": { price: 90, duration_mins: 60 },
      "deep-tissue-massage": { price: 110, duration_mins: 60 },
    },
  },
];

export const EMERGENCY_FEE = 15;
export const DEPOSIT_RATE = 0.3;

export function getProById(id: string): MockProListing | undefined {
  return MOCK_PROS.find((p) => p.id === id);
}

export function getServiceById(id: string): Service | undefined {
  return MOCK_SERVICES.find((s) => s.id === id);
}

export function getProsForService(serviceId: string): MockProListing[] {
  return MOCK_PROS.filter((p) => p.offerings[serviceId]);
}

export function getProServicePrice(
  pro: MockProListing,
  serviceId: string
): { price: number; duration_mins: number } | null {
  return pro.offerings[serviceId] ?? null;
}

export function proBadge(score: number): {
  label: string;
  tone: "gold" | "purple" | "muted";
} {
  if (score >= 90) return { label: "Elite Pro", tone: "gold" };
  if (score >= 75) return { label: "Top Pro", tone: "purple" };
  return { label: "Verified Pro", tone: "muted" };
}

/**
 * Format a GBP-canonical amount.
 * Prefer `useMarket().formatMoney` in client UI so toggles re-render.
 * This helper reads stored market for non-React call sites.
 */
export function formatMoney(amount: number): string {
  const market =
    typeof window !== "undefined" ? readStoredMarket() : DEFAULT_MARKET;
  return formatMoneyGbp(amount, market);
}
