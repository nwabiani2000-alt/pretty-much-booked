import { apiFetch } from './api';

export type AuthSession = {
  phone: string;
  userId: string;
  mode: 'live' | 'mock';
  accessToken?: string;
};

export type AuthConfig = {
  supabaseEnabled: boolean;
  mode: 'live' | 'mock';
  channel?: string;
};

const SESSION_KEY = 'pmb_auth_session';
let memorySession: AuthSession | null = null;

function storageGet(key: string): string | null {
  if (typeof sessionStorage !== 'undefined') {
    try {
      return sessionStorage.getItem(key);
    } catch {
      /* ignore */
    }
  }
  return null;
}

function storageSet(key: string, value: string): void {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  }
}

function storageRemove(key: string): void {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export function loadAuthSession(): AuthSession | null {
  if (memorySession) return memorySession;
  try {
    const raw = storageGet(SESSION_KEY);
    if (!raw) return null;
    memorySession = JSON.parse(raw) as AuthSession;
    return memorySession;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession): void {
  memorySession = session;
  storageSet(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  memorySession = null;
  storageRemove(SESSION_KEY);
}

/** Normalize UK-ish phone to E.164 for OTP APIs. */
export function normalizePhone(input: string): string {
  const cleaned = input.replace(/[^\d+]/g, '').trim();
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+44${cleaned.slice(1)}`;
  }
  if (cleaned.length === 10) return `+44${cleaned}`;
  return `+${cleaned}`;
}

export function isValidPhone(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(normalizePhone(phone));
}

export async function fetchAuthConfig(): Promise<AuthConfig> {
  try {
    const res = await apiFetch('/api/auth/config');
    if (!res.ok) throw new Error('config failed');
    return (await res.json()) as AuthConfig;
  } catch {
    return { supabaseEnabled: false, mode: 'mock', channel: 'phone_otp' };
  }
}

export async function sendOtp(phone: string): Promise<{
  ok: boolean;
  mode?: string;
  hint?: string;
  error?: string;
}> {
  const res = await apiFetch('/api/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    hint?: string;
    mode?: string;
    error?: string;
  };
  if (!res.ok) return { ok: false, error: data.error || 'Could not send code' };
  return { ok: true, mode: data.mode, hint: data.hint };
}

export async function verifyOtp(
  phone: string,
  token: string
): Promise<{ ok: boolean; session?: AuthSession; error?: string }> {
  const res = await apiFetch('/api/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, token }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    session?: AuthSession;
    error?: string;
  };
  if (!res.ok) return { ok: false, error: data.error || 'Invalid code' };
  return { ok: true, session: data.session };
}
