import { corsPreflight, withCors } from "@/lib/cors";
import { recordSupabaseQuery } from "@/lib/security/alerts";
import {
  clearFailedAuth,
  getClientIp,
  isIpBlocked,
  recordFailedAuth,
} from "@/lib/security/ip-block";
import {
  clientKey,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { otpVerifySchema } from "@/lib/security/schemas";
import { getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/otp/verify
 * Live: verifyOtp phone/sms.
 * Mock: accept 000000 when keys missing.
 * Rate limit: 5 / 15 min / IP. Brute force: >10 fails → IP block.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isIpBlocked(ip)) {
    return withCors(
      NextResponse.json({ error: "IP temporarily blocked" }, { status: 403 }),
      req
    );
  }

  const rl = rateLimit(clientKey(req, "otp:verify"), 5, 15 * 60_000);
  const headers = rateLimitHeaders(rl);
  if (!rl.ok) {
    recordFailedAuth(ip, "otp_verify_rate");
    return withCors(
      NextResponse.json(
        { error: "Too many attempts — try again later" },
        { status: 429, headers }
      ),
      req
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return withCors(
      NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers }),
      req
    );
  }

  const parsed = otpVerifySchema.safeParse(raw);
  if (!parsed.success) {
    return withCors(
      NextResponse.json(
        { error: "Valid phone and code required" },
        { status: 400, headers }
      ),
      req
    );
  }

  const { phone, token } = parsed.data;
  if (!/^\d{4,8}$/.test(token)) {
    return withCors(
      NextResponse.json(
        { error: "Invalid code format" },
        { status: 400, headers }
      ),
      req
    );
  }

  if (!isSupabaseConfigured()) {
    if (token !== "000000") {
      const { blocked } = recordFailedAuth(ip, "otp_verify");
      return withCors(
        NextResponse.json(
          { error: blocked ? "IP temporarily blocked" : "Invalid code" },
          { status: blocked ? 403 : 401, headers }
        ),
        req
      );
    }
    clearFailedAuth(ip);
    return withCors(
      NextResponse.json(
        {
          mode: "mock",
          verified: true,
          session: {
            phone,
            userId: `mock_${phone.replace(/\D/g, "").slice(-8)}`,
            mode: "mock" as const,
          },
        },
        { headers }
      ),
      req
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return withCors(
      NextResponse.json(
        { error: "Something went wrong" },
        { status: 503, headers }
      ),
      req
    );
  }

  recordSupabaseQuery(1);
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    console.error("[otp/verify]", error.message);
    const { blocked } = recordFailedAuth(ip, "otp_verify");
    return withCors(
      NextResponse.json(
        { error: blocked ? "IP temporarily blocked" : "Invalid code" },
        { status: blocked ? 403 : 401, headers }
      ),
      req
    );
  }

  clearFailedAuth(ip);
  return withCors(
    NextResponse.json(
      {
        mode: "live",
        verified: true,
        session: {
          phone,
          userId: data.user?.id ?? "unknown",
          mode: "live" as const,
          accessToken: data.session?.access_token,
        },
      },
      { headers }
    ),
    req
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
