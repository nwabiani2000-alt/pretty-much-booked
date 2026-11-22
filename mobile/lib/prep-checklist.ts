/**
 * Prep checklist by service category — reduce failed home visits.
 */

import type { ServiceCategory } from "./services";

export type PrepItem = {
  id: string;
  label: string;
};

const SHARED: PrepItem[] = [
  { id: "outlet", label: "Clear floor space + nearby power outlet" },
  { id: "access", label: "Someone home to let the pro in" },
];

const BY_CATEGORY: Partial<Record<ServiceCategory, PrepItem[]>> = {
  hair: [
    { id: "wash", label: "Hair washed & dry (unless service says otherwise)" },
    { id: "no_wet", label: "No heavy oils or wet braids from overnight" },
  ],
  nails: [
    { id: "no_acrylic", label: "No hard-gel / acrylic removal needed (ban)" },
    { id: "hands", label: "Hands clean; polish removed if switching colour" },
  ],
  makeup: [
    { id: "skin", label: "Clean, moisturised face — no heavy base" },
    { id: "light", label: "Bright natural light or a lamp ready" },
  ],
  lashes: [
    { id: "no_mascara", label: "No mascara or lash extensions already on" },
    { id: "contacts", label: "Contacts out if you wear them" },
  ],
  massage: [
    { id: "space", label: "Quiet room; bed or floor space for the table" },
  ],
  barber: [
    { id: "dry_hair", label: "Hair dry and detangled" },
  ],
};

export function prepChecklist(category: ServiceCategory): PrepItem[] {
  return [...SHARED, ...(BY_CATEGORY[category] ?? [])];
}
