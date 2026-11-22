import type { MarketId } from "@/lib/market";
import type { ServiceCategory } from "@/types/booking";

export type ProSpecialty = Extract<
  ServiceCategory,
  "hair" | "nails" | "makeup" | "lashes" | "massage" | "barber"
>;

export type ProOfferingDraft = {
  serviceId: string;
  price: number;
  durationMins: number;
};

export type ProOnboardingDraft = {
  phone: string;
  verified: boolean;
  displayName: string;
  specialties: ProSpecialty[];
  /** Market city for the pro */
  city: MarketId;
  /** Portfolio / Instagram / website links (newline or comma separated stored as list) */
  portfolioUrls: string[];
  photoSet: boolean;
  offerings: ProOfferingDraft[];
  radiusKm: number;
  availableWeekdays: boolean;
  availableWeekends: boolean;
  completedAt?: string;
};

const KEY = "pmb_pro_onboarding";

export const SPECIALTY_OPTIONS: { id: ProSpecialty; label: string }[] = [
  { id: "hair", label: "Hair" },
  { id: "nails", label: "Nails" },
  { id: "makeup", label: "Makeup" },
  { id: "lashes", label: "Lashes" },
  { id: "massage", label: "Massage" },
  { id: "barber", label: "Barber" },
];

export const EMPTY_PRO_DRAFT: ProOnboardingDraft = {
  phone: "",
  verified: false,
  displayName: "",
  specialties: [],
  city: "london",
  portfolioUrls: [],
  photoSet: false,
  offerings: [],
  radiusKm: 10,
  availableWeekdays: true,
  availableWeekends: true,
};

function readStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.localStorage.getItem(KEY) ?? window.sessionStorage.getItem(KEY)
    );
  } catch {
    return null;
  }
}

export function loadProDraft(): ProOnboardingDraft {
  if (typeof window === "undefined") return { ...EMPTY_PRO_DRAFT };
  try {
    const raw = readStorage();
    if (!raw) return { ...EMPTY_PRO_DRAFT };
    const parsed = JSON.parse(raw) as Partial<ProOnboardingDraft>;
    return {
      ...EMPTY_PRO_DRAFT,
      ...parsed,
      city: parsed.city === "lagos" ? "lagos" : "london",
      portfolioUrls: Array.isArray(parsed.portfolioUrls)
        ? parsed.portfolioUrls
        : [],
      specialties: Array.isArray(parsed.specialties) ? parsed.specialties : [],
    };
  } catch {
    return { ...EMPTY_PRO_DRAFT };
  }
}

export function saveProDraft(draft: ProOnboardingDraft): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(draft);
  try {
    window.localStorage.setItem(KEY, json);
  } catch {
    /* ignore */
  }
  try {
    window.sessionStorage.setItem(KEY, json);
  } catch {
    /* ignore */
  }
}

export function clearProDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function parsePortfolioInput(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export type OnboardingStep =
  | "verify"
  | "profile"
  | "services"
  | "availability"
  | "done";

export const ONBOARDING_STEPS: {
  id: OnboardingStep;
  label: string;
  index: number;
}[] = [
  { id: "verify", label: "Verify", index: 1 },
  { id: "profile", label: "Profile", index: 2 },
  { id: "services", label: "Services", index: 3 },
  { id: "availability", label: "Area", index: 4 },
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

export function parseStep(raw: string | null): OnboardingStep {
  if (
    raw === "verify" ||
    raw === "profile" ||
    raw === "services" ||
    raw === "availability" ||
    raw === "done"
  ) {
    return raw;
  }
  return "verify";
}
