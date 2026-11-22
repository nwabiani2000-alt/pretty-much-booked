/**
 * Browser-safe auth helpers.
 * Live OTP goes through /api/auth/otp/* (server holds SUPABASE_* keys).
 * Mock mode persists a lightweight session in sessionStorage.
 */

export type AuthSession = {
  phone: string;
  userId: string;
  mode: "live" | "mock";
  accessToken?: string;
};

const SESSION_KEY = "pmb_auth_session";

export function loadAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Normalize UK-ish phone to E.164 for OTP APIs. */
export function normalizePhone(input: string): string {
  const cleaned = input.replace(/[^\d+]/g, "").trim();
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return `+44${cleaned.slice(1)}`;
  }
  if (cleaned.length === 10) return `+44${cleaned}`;
  return `+${cleaned}`;
}

export function isValidPhone(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(normalizePhone(phone));
}
