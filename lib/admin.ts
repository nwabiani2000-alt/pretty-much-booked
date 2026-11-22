export type VetStatus = "pending" | "approved" | "rejected";

export type AdminPro = {
  id: string;
  displayName: string;
  phone: string;
  specialties: string[];
  servicesCount: number;
  radiusKm: number;
  city: string;
  submittedAt: string;
  status: VetStatus;
};

export type DisputeStatus = "open" | "resolved";

export type AdminDispute = {
  id: string;
  bookingId: string;
  customerName: string;
  proName: string;
  serviceName: string;
  amount: number;
  reason: string;
  openedAt: string;
  status: DisputeStatus;
  resolutionNote?: string;
};

const PROS_KEY = "pmb_admin_pros";
const DISPUTES_KEY = "pmb_admin_disputes";

const SEED_PROS: AdminPro[] = [
  {
    id: "ap_1",
    displayName: "Nia O.",
    phone: "+44 7700 900201",
    specialties: ["Hair", "Nails"],
    servicesCount: 4,
    radiusKm: 12,
    city: "London",
    submittedAt: "2026-11-20",
    status: "pending",
  },
  {
    id: "ap_2",
    displayName: "Tunde A.",
    phone: "+44 7700 900202",
    specialties: ["Barber"],
    servicesCount: 2,
    radiusKm: 8,
    city: "London",
    submittedAt: "2026-11-21",
    status: "pending",
  },
  {
    id: "ap_3",
    displayName: "Amara K.",
    phone: "+44 7700 900203",
    specialties: ["Lashes", "Makeup"],
    servicesCount: 3,
    radiusKm: 10,
    city: "Lagos",
    submittedAt: "2026-11-19",
    status: "pending",
  },
  {
    id: "ap_4",
    displayName: "Keisha M.",
    phone: "+44 7700 900204",
    specialties: ["Makeup"],
    servicesCount: 2,
    radiusKm: 15,
    city: "London",
    submittedAt: "2026-11-18",
    status: "approved",
  },
];

const SEED_DISPUTES: AdminDispute[] = [
  {
    id: "ad_1",
    bookingId: "bk_dispute_1",
    customerName: "Sam R.",
    proName: "Aisha B.",
    serviceName: "Box Braids",
    amount: 85,
    reason: "Pro arrived late · customer wants partial refund",
    openedAt: "2026-11-21",
    status: "open",
  },
  {
    id: "ad_2",
    bookingId: "bk_dispute_2",
    customerName: "Elena M.",
    proName: "Nia O.",
    serviceName: "Gel Manicure",
    amount: 45,
    reason: "Service quality · chips within 24h",
    openedAt: "2026-11-22",
    status: "open",
  },
  {
    id: "ad_3",
    bookingId: "bk_dispute_3",
    customerName: "Omar H.",
    proName: "Tunde A.",
    serviceName: "Fade / Haircut",
    amount: 35,
    reason: "No-show claim (pro disputes)",
    openedAt: "2026-11-15",
    status: "resolved",
    resolutionNote: "Full refund issued · pro warned",
  },
];

function read<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed.map((x) => ({ ...x }));
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      sessionStorage.setItem(key, JSON.stringify(seed));
      return seed.map((x) => ({ ...x }));
    }
    return JSON.parse(raw) as T[];
  } catch {
    return seed.map((x) => ({ ...x }));
  }
}

function write<T>(key: string, data: T[]): void {
  sessionStorage.setItem(key, JSON.stringify(data));
}

export function loadAdminPros(): AdminPro[] {
  return read(PROS_KEY, SEED_PROS);
}

export function saveAdminPros(pros: AdminPro[]): void {
  write(PROS_KEY, pros);
}

export function getAdminPro(id: string): AdminPro | undefined {
  return loadAdminPros().find((p) => p.id === id);
}

export function setProVetStatus(
  id: string,
  status: Exclude<VetStatus, "pending">
): AdminPro | null {
  const list = loadAdminPros();
  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], status };
  saveAdminPros(list);
  return list[idx];
}

export function loadDisputes(): AdminDispute[] {
  return read(DISPUTES_KEY, SEED_DISPUTES);
}

export function saveDisputes(disputes: AdminDispute[]): void {
  write(DISPUTES_KEY, disputes);
}

export function getDispute(id: string): AdminDispute | undefined {
  return loadDisputes().find((d) => d.id === id);
}

export function resolveDispute(
  id: string,
  resolutionNote: string
): AdminDispute | null {
  const list = loadDisputes();
  const idx = list.findIndex((d) => d.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], status: "resolved", resolutionNote };
  saveDisputes(list);
  return list[idx];
}

export function adminCounts() {
  const pros = loadAdminPros();
  const disputes = loadDisputes();
  return {
    pendingPros: pros.filter((p) => p.status === "pending").length,
    openDisputes: disputes.filter((d) => d.status === "open").length,
  };
}
