export type ProSpecialty =
  | 'hair'
  | 'nails'
  | 'makeup'
  | 'lashes'
  | 'massage'
  | 'barber';

export type ProOfferingDraft = {
  serviceId: string;
  price: number;
  durationMins: number;
};

export type ProCity = 'london' | 'lagos';

export type ProOnboardingDraft = {
  phone: string;
  verified: boolean;
  displayName: string;
  specialties: ProSpecialty[];
  city: ProCity;
  portfolioUrls: string[];
  photoSet: boolean;
  offerings: ProOfferingDraft[];
  radiusKm: number;
  availableWeekdays: boolean;
  availableWeekends: boolean;
  completedAt?: string;
};

const KEY = 'pmb_pro_onboarding';

export const SPECIALTY_OPTIONS: { id: ProSpecialty; label: string }[] = [
  { id: 'hair', label: 'Hair' },
  { id: 'nails', label: 'Nails' },
  { id: 'makeup', label: 'Makeup' },
  { id: 'lashes', label: 'Lashes' },
  { id: 'massage', label: 'Massage' },
  { id: 'barber', label: 'Barber' },
];

export const EMPTY_PRO_DRAFT: ProOnboardingDraft = {
  phone: '',
  verified: false,
  displayName: '',
  specialties: [],
  city: 'london',
  portfolioUrls: [],
  photoSet: false,
  offerings: [],
  radiusKm: 10,
  availableWeekdays: true,
  availableWeekends: true,
};

let memory: ProOnboardingDraft | null = null;

function readStorage(): string | null {
  try {
    if (typeof sessionStorage !== 'undefined') return sessionStorage.getItem(KEY);
  } catch {
    /* ignore */
  }
  return null;
}

function writeStorage(value: string): void {
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(KEY, value);
  } catch {
    /* ignore */
  }
}

export function loadProDraft(): ProOnboardingDraft {
  if (memory) return memory;
  try {
    const raw = readStorage();
    if (!raw) {
      memory = { ...EMPTY_PRO_DRAFT };
      return memory;
    }
    memory = { ...EMPTY_PRO_DRAFT, ...(JSON.parse(raw) as ProOnboardingDraft) };
    return memory;
  } catch {
    memory = { ...EMPTY_PRO_DRAFT };
    return memory;
  }
}

export function saveProDraft(draft: ProOnboardingDraft): void {
  memory = draft;
  writeStorage(JSON.stringify(draft));
}

export type OnboardingStep =
  | 'verify'
  | 'profile'
  | 'services'
  | 'availability'
  | 'done';

export const TOTAL_STEPS = 4;

export function parseStep(raw: string | null | undefined): OnboardingStep {
  if (
    raw === 'verify' ||
    raw === 'profile' ||
    raw === 'services' ||
    raw === 'availability' ||
    raw === 'done'
  ) {
    return raw;
  }
  return 'verify';
}
