import {
  DEFAULT_MARKET,
  formatFromPriceGbp,
  readStoredMarket,
} from "@/lib/market";
import type { Service, ServiceCategory } from "@/types/booking";

/** Seed services from Pretty Much Booked build spec. */
export const MOCK_SERVICES: Service[] = [
  {
    id: "box-braids",
    name: "Box Braids",
    category: "hair",
    description: "Protective braiding, all lengths",
    icon: "💇‍♀️",
    base_price: 85,
    duration_mins: 180,
  },
  {
    id: "silk-press",
    name: "Silk Press",
    category: "hair",
    description: "Smooth, sleek blowout",
    icon: "✨",
    base_price: 65,
    duration_mins: 90,
  },
  {
    id: "gel-manicure",
    name: "Gel Manicure",
    category: "nails",
    description: "Long-lasting gel polish",
    icon: "💅",
    base_price: 45,
    duration_mins: 60,
  },
  {
    id: "acrylic-nails",
    name: "Acrylic Nails",
    category: "nails",
    description: "Full set, any design",
    icon: "💅",
    base_price: 65,
    duration_mins: 120,
  },
  {
    id: "soft-glam-makeup",
    name: "Soft Glam Makeup",
    category: "makeup",
    description: "Natural, everyday glam",
    icon: "💄",
    base_price: 75,
    duration_mins: 60,
  },
  {
    id: "full-glam-makeup",
    name: "Full Glam Makeup",
    category: "makeup",
    description: "Full coverage, event ready",
    icon: "💄",
    base_price: 120,
    duration_mins: 90,
  },
  {
    id: "classic-lashes",
    name: "Classic Lashes",
    category: "lashes",
    description: "Natural lash extensions",
    icon: "👁",
    base_price: 70,
    duration_mins: 90,
  },
  {
    id: "volume-lashes",
    name: "Volume Lashes",
    category: "lashes",
    description: "Full, dramatic volume",
    icon: "👁",
    base_price: 95,
    duration_mins: 120,
  },
  {
    id: "swedish-massage",
    name: "Swedish Massage",
    category: "massage",
    description: "Relaxing full body",
    icon: "💆‍♀️",
    base_price: 90,
    duration_mins: 60,
  },
  {
    id: "deep-tissue-massage",
    name: "Deep Tissue Massage",
    category: "massage",
    description: "Targeted muscle relief",
    icon: "💆‍♀️",
    base_price: 110,
    duration_mins: 60,
  },
  {
    id: "fade-haircut",
    name: "Fade / Haircut",
    category: "barber",
    description: "Clean fade, shape up",
    icon: "💈",
    base_price: 35,
    duration_mins: 45,
  },
  {
    id: "beard-trim",
    name: "Beard Trim",
    category: "barber",
    description: "Shape and line up",
    icon: "💈",
    base_price: 25,
    duration_mins: 30,
  },
];

/** Home first-choice categories only (Hick's Law). */
export const HOME_CATEGORIES: {
  id: Extract<ServiceCategory, "hair" | "nails" | "makeup">;
  label: string;
  blurb: string;
  gradient: string;
  emoji: string;
}[] = [
  {
    id: "hair",
    label: "Hair",
    blurb: "Braids, press & more",
    gradient: "from-[#5B2C87] to-[#8B5CF6]",
    emoji: "💇‍♀️",
  },
  {
    id: "nails",
    label: "Nails",
    blurb: "Gel, acrylic, designs",
    gradient: "from-[#4A1F6B] to-[#D4AF37]",
    emoji: "💅",
  },
  {
    id: "makeup",
    label: "Makeup",
    blurb: "Soft glam to full glam",
    gradient: "from-[#7C3AED] to-[#5B2C87]",
    emoji: "💄",
  },
];

/** Popular services per category — max 4–6 for selection screen. */
export const POPULAR_BY_CATEGORY: Record<string, string[]> = {
  hair: ["box-braids", "silk-press", "fade-haircut"],
  nails: ["gel-manicure", "acrylic-nails"],
  makeup: ["soft-glam-makeup", "full-glam-makeup", "classic-lashes", "volume-lashes"],
};

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
  if (m === 0) return h === 1 ? "1 hr" : `${h} hrs`;
  return `${h}h ${m}m`;
}

/** Prefer `useMarket().formatFromPrice` in client UI for live toggles. */
export function formatFromPrice(price: number): string {
  const market =
    typeof window !== "undefined" ? readStoredMarket() : DEFAULT_MARKET;
  return formatFromPriceGbp(price, market);
}
