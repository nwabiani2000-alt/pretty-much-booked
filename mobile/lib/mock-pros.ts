import { formatMoneyGbp, readStoredMarket } from './market';
import { MOCK_SERVICES, type Service } from './services';

export type MockProListing = {
  id: string;
  display_name: string;
  initials: string;
  bio: string;
  rating: number;
  pro_score: number;
  reviews: number;
  is_verified: boolean;
  is_available_now: boolean;
  distance_miles: number;
  next_available: string;
  offerings: Record<string, { price: number; duration_mins: number }>;
};

/** Enough hair pros so “Show more” is real on Box Braids. */
export const MOCK_PROS: MockProListing[] = [
  {
    id: '1',
    display_name: 'Aisha B.',
    initials: 'AB',
    bio: 'London-based braiding specialist.',
    rating: 4.9,
    pro_score: 98,
    reviews: 127,
    is_verified: true,
    is_available_now: true,
    distance_miles: 2.3,
    next_available: 'Today 2:00 PM',
    offerings: {
      'box-braids': { price: 85, duration_mins: 180 },
      'silk-press': { price: 65, duration_mins: 90 },
    },
  },
  {
    id: '2',
    display_name: 'Nia O.',
    initials: 'NO',
    bio: 'Protective styles with precision parting.',
    rating: 4.8,
    pro_score: 99,
    reviews: 204,
    is_verified: true,
    is_available_now: true,
    distance_miles: 4.2,
    next_available: 'Today 5:00 PM',
    offerings: {
      'box-braids': { price: 110, duration_mins: 210 },
      'gel-manicure': { price: 48, duration_mins: 60 },
    },
  },
  {
    id: '3',
    display_name: 'Keisha M.',
    initials: 'KM',
    bio: 'Soft glam to full glam.',
    rating: 4.95,
    pro_score: 96,
    reviews: 89,
    is_verified: true,
    is_available_now: false,
    distance_miles: 1.8,
    next_available: 'Tomorrow 10:00 AM',
    offerings: {
      'soft-glam-makeup': { price: 75, duration_mins: 60 },
      'full-glam-makeup': { price: 120, duration_mins: 90 },
      'classic-lashes': { price: 70, duration_mins: 90 },
      'box-braids': { price: 95, duration_mins: 200 },
    },
  },
  {
    id: '4',
    display_name: 'Tunde A.',
    initials: 'TA',
    bio: 'Clean fades and sharp line-ups.',
    rating: 4.7,
    pro_score: 88,
    reviews: 156,
    is_verified: true,
    is_available_now: true,
    distance_miles: 3.1,
    next_available: 'Today 3:30 PM',
    offerings: {
      'fade-haircut': { price: 35, duration_mins: 45 },
      'silk-press': { price: 70, duration_mins: 100 },
    },
  },
  {
    id: '5',
    display_name: 'Amara K.',
    initials: 'AK',
    bio: 'Volume and classic lashes.',
    rating: 4.85,
    pro_score: 92,
    reviews: 143,
    is_verified: true,
    is_available_now: true,
    distance_miles: 2.9,
    next_available: 'Today 4:00 PM',
    offerings: {
      'classic-lashes': { price: 72, duration_mins: 90 },
      'volume-lashes': { price: 95, duration_mins: 120 },
      'acrylic-nails': { price: 68, duration_mins: 120 },
      'box-braids': { price: 100, duration_mins: 190 },
    },
  },
  {
    id: '6',
    display_name: 'Zara L.',
    initials: 'ZL',
    bio: 'Knotless and box braids — calm chair energy.',
    rating: 4.88,
    pro_score: 94,
    reviews: 112,
    is_verified: true,
    is_available_now: false,
    distance_miles: 3.6,
    next_available: 'Tomorrow 12:00 PM',
    offerings: {
      'box-braids': { price: 90, duration_mins: 180 },
      'silk-press': { price: 68, duration_mins: 90 },
      'gel-manicure': { price: 45, duration_mins: 60 },
    },
  },
  {
    id: '7',
    display_name: 'Maya R.',
    initials: 'MR',
    bio: 'Event makeup and soft glam.',
    rating: 4.82,
    pro_score: 91,
    reviews: 76,
    is_verified: true,
    is_available_now: true,
    distance_miles: 2.1,
    next_available: 'Today 6:00 PM',
    offerings: {
      'soft-glam-makeup': { price: 80, duration_mins: 70 },
      'full-glam-makeup': { price: 130, duration_mins: 100 },
      'volume-lashes': { price: 98, duration_mins: 120 },
      'acrylic-nails': { price: 65, duration_mins: 120 },
    },
  },
];

export const EMERGENCY_FEE = 15;
export const DEPOSIT_RATE = 0.3;
export const MOCK_ADDRESS = '42 Curtain Road, Shoreditch, London EC2A 3NH';

export function getProById(id: string): MockProListing | undefined {
  return MOCK_PROS.find((p) => p.id === id);
}

export function getServiceByIdSafe(id: string): Service | undefined {
  return MOCK_SERVICES.find((s) => s.id === id);
}

export function getProsForService(serviceId: string): MockProListing[] {
  return MOCK_PROS.filter((p) => p.offerings[serviceId]).sort(
    (a, b) => b.pro_score - a.pro_score
  );
}

export function proBadge(score: number): {
  label: string;
  tone: 'gold' | 'purple' | 'muted';
} {
  if (score >= 90) return { label: 'Elite', tone: 'gold' };
  if (score >= 75) return { label: 'Top', tone: 'purple' };
  return { label: 'Verified', tone: 'muted' };
}

/**
 * Format a GBP-canonical amount.
 * Prefer `useMarket().formatMoney` in UI so toggles re-render.
 */
export function formatMoney(amount: number): string {
  return formatMoneyGbp(amount, readStoredMarket());
}
