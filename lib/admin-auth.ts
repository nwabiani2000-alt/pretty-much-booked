/**
 * Simple admin gate — cookie session when ADMIN_SECRET matches.
 * If ADMIN_SECRET unset, demo secret `pmb-admin-demo` works (dev only).
 */

export const ADMIN_COOKIE = "pmb_admin_session";
export const ADMIN_DEMO_SECRET = "pmb-admin-demo";

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET?.trim() || ADMIN_DEMO_SECRET;
}

export function isAdminDemoMode(): boolean {
  return !process.env.ADMIN_SECRET?.trim();
}

/** Token = base64(secret|timestamp) — enough for scaffold, not production crypto. */
export function mintAdminToken(secret: string = getAdminSecret()): string {
  const payload = `${secret}|${Date.now()}`;
  if (typeof Buffer !== "undefined") {
    return Buffer.from(payload, "utf8").toString("base64url");
  }
  return btoa(payload);
}

export function verifyAdminToken(
  token: string | null | undefined,
  secret: string = getAdminSecret()
): boolean {
  if (!token) return false;
  try {
    const raw =
      typeof Buffer !== "undefined"
        ? Buffer.from(token, "base64url").toString("utf8")
        : atob(token);
    const [s] = raw.split("|");
    return s === secret;
  } catch {
    return false;
  }
}
