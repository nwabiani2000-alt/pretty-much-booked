/**
 * Pro KYC stub — ID / selfie placeholders + pending verification flag.
 */

export type ProKycState = {
  idUploaded: boolean;
  selfieUploaded: boolean;
  status: "none" | "pending" | "verified" | "rejected";
  submittedAt?: string;
};

const KEY = "pmb_pro_kyc";

export const EMPTY_KYC: ProKycState = {
  idUploaded: false,
  selfieUploaded: false,
  status: "none",
};

export function loadProKyc(): ProKycState {
  if (typeof window === "undefined") return { ...EMPTY_KYC };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_KYC };
    return { ...EMPTY_KYC, ...(JSON.parse(raw) as ProKycState) };
  } catch {
    return { ...EMPTY_KYC };
  }
}

export function saveProKyc(state: ProKycState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function submitProKyc(partial: Partial<ProKycState>): ProKycState {
  const next: ProKycState = {
    ...loadProKyc(),
    ...partial,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  saveProKyc(next);
  return next;
}
