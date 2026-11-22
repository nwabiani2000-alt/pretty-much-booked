import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase-server";
import { createHmac, timingSafeEqual } from "crypto";

const MOCK_USER_HEADER = "x-pmb-user-id";
const ACCESS_TOKEN_HEADER = "x-pmb-access-token";

function signingSecret(): string {
  return (
    process.env.JWT_SECRET?.trim() ||
    process.env.ADMIN_SECRET?.trim() ||
    "pmb-dev-signing-secret-change-me"
  );
}

/** Mint opaque booking access token (HMAC). */
export function mintBookingAccessToken(bookingId: string, customerId: string): string {
  const payload = `${bookingId}.${customerId}`;
  const sig = createHmac("sha256", signingSecret())
    .update(payload)
    .digest("base64url");
  return `${Buffer.from(payload, "utf8").toString("base64url")}.${sig}`;
}

export function verifyBookingAccessToken(
  token: string | null | undefined,
  bookingId: string,
  customerId: string
): boolean {
  if (!token) return false;
  try {
    const expected = mintBookingAccessToken(bookingId, customerId);
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export type AuthContext = {
  userId: string | null;
  role: "customer" | "pro" | "admin" | "anonymous";
  source: "supabase" | "mock-header" | "none";
  accessToken: string | null;
};

/**
 * Resolve caller identity.
 * Live: Authorization Bearer Supabase JWT.
 * Mock: x-pmb-user-id header (dev only when Supabase unset).
 */
export async function resolveAuth(req: Request): Promise<AuthContext> {
  const accessToken =
    req.headers.get(ACCESS_TOKEN_HEADER)?.trim() ||
    new URL(req.url).searchParams.get("access_token") ||
    null;

  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (bearer && isSupabaseConfigured()) {
    const url = getSupabaseUrl();
    const anon = getSupabaseAnonKey();
    if (url && anon) {
      const sb = createClient(url, anon, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data } = await sb.auth.getUser(bearer);
      if (data.user?.id) {
        return {
          userId: data.user.id,
          role: "customer",
          source: "supabase",
          accessToken,
        };
      }
    }
  }

  // Mock / local only — never trust this header when Supabase is live.
  if (!isSupabaseConfigured()) {
    const mockUser = req.headers.get(MOCK_USER_HEADER)?.trim();
    if (mockUser) {
      return {
        userId: mockUser,
        role: "customer",
        source: "mock-header",
        accessToken,
      };
    }
  }

  return {
    userId: null,
    role: "anonymous",
    source: "none",
    accessToken,
  };
}

export { MOCK_USER_HEADER, ACCESS_TOKEN_HEADER };
