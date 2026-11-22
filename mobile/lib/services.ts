import { formatFromPriceGbp, readStoredMarket } from './market';

export type ServiceCategory = 'hair' | 'nails' | 'makeup' | 'lashes' | 'massage' | 'barber';

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  base_price: number;
  duration_mins: number;
};

export const MOCK_SERVICES: Service[] = [
  {
    id: 'box-braids',
    name: 'Box Braids',
    category: 'hair',
    description: 'Protective braiding, all lengths',
    base_price: 85,
    duration_mins: 180,
  },
  {
    id: 'silk-press',
    name: 'Silk Press',
    category: 'hair',
    description: 'Smooth, sleek blowout',
    base_price: 65,
    duration_mins: 90,
  },
  {
    id: 'fade-haircut',
    name: 'Fade / Haircut',
    category: 'hair',
    description: 'Clean fade, shape up',
    base_price: 35,
    duration_mins: 45,
  },
  {
    id: 'gel-manicure',
    name: 'Gel Manicure',
    category: 'nails',
    description: 'Long-lasting gel polish',
    base_price: 45,
    duration_mins: 60,
  },
  {
    id: 'acrylic-nails',
    name: 'Acrylic Nails',
    category: 'nails',
    description: 'Full set, any design',
    base_price: 65,
    duration_mins: 120,
  },
  {
    id: 'soft-glam-makeup',
    name: 'Soft Glam Makeup',
    category: 'makeup',
    description: 'Natural, everyday glam',
    base_price: 75,
    duration_mins: 60,
  },
  {
    id: 'full-glam-makeup',
    name: 'Full Glam Makeup',
    category: 'makeup',
    description: 'Full coverage, event ready',
    base_price: 120,
    duration_mins: 90,
  },
  {
    id: 'classic-lashes',
    name: 'Classic Lashes',
    category: 'makeup',
    description: 'Natural lash extensions',
    base_price: 70,
    duration_mins: 90,
  },
  {
    id: 'volume-lashes',
    name: 'Volume Lashes',
    category: 'makeup',
    description: 'Full, dramatic volume',
    base_price: 95,
    duration_mins: 120,
  },
];

export const POPULAR_BY_CATEGORY: Record<string, string[]> = {
  hair: ['box-braids', 'silk-press', 'fade-haircut'],
  nails: ['gel-manicure', 'acrylic-nails'],
  makeup: ['soft-glam-makeup', 'full-glam-makeup', 'classic-lashes', 'volume-lashes'],
};

export function getServiceById(id: string): Service | undefined {
  return MOCK_SERVICES.find((s) => s.id === id);
}

export function getPopularServices(category: string): Service[] {
  const ids = POPULAR_BY_CATEGORY[category] ?? [];
  return ids
    .map((id) => MOCK_SERVICES.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s));
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return h === 1 ? '1 hr' : `${h} hrs`;
  return `${h}h ${m}m`;
}

/**
 * Prefer `useMarket().formatFromPrice` in UI so toggles re-render.
 */
export function formatFromPrice(price: number): string {
  return formatFromPriceGbp(price, readStoredMarket());
}
