/**
 * Simple admin gate — cookie session when ADMIN_SECRET matches.
 * If ADMIN_SECRET unset, demo secret `pmb-admin-demo` works (dev only).
 * Edge-safe base64url helpers (middleware + Node API).
 */

export const ADMIN_COOKIE = "pmb_admin_session";
export const ADMIN_DEMO_SECRET = "pmb-admin-demo";

function toBase64Url(s: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(s, "utf8").toString("base64url");
  }
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(s, "base64url").toString("utf8");
  }
  const pad = s + "===".slice((s.length + 3) % 4);
  const b64 = pad.replace(/-/g, "+").replace(/_/g, "/");
  return atob(b64);
}

export function getAdminSecret(): string {
  const fromEnv = process.env.ADMIN_SECRET?.trim();
  if (fromEnv) return fromEnv;
  // Never allow demo secret in production.
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return ADMIN_DEMO_SECRET;
}

export function isAdminDemoMode(): boolean {
  return !process.env.ADMIN_SECRET?.trim() && process.env.NODE_ENV !== "production";
}

/** Token = base64url(secret|timestamp) — scaffold auth, rotate via ADMIN_SECRET. */
export function mintAdminToken(secret: string = getAdminSecret()): string {
  return toBase64Url(`${secret}|${Date.now()}`);
}

export function verifyAdminToken(
  token: string | null | undefined,
  secret: string = getAdminSecret()
): boolean {
  if (!token || !secret) return false;
  try {
    const raw = fromBase64Url(token);
    const [s] = raw.split("|");
    return s === secret;
  } catch {
    return false;
  }
}
