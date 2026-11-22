import { corsPreflight, withCors } from "@/lib/cors";
import { recordSupabaseQuery } from "@/lib/security/alerts";
import {
  getClientIp,
  isIpBlocked,
  recordFailedAuth,
} from "@/lib/security/ip-block";
import {
  clientKey,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { otpSendSchema } from "@/lib/security/schemas";
import { getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/otp/send
 * Live: Supabase signInWithOtp({ phone }).
 * Mock: ack without SMS when SUPABASE_* missing.
 * Rate limit: 5 / 15 min / IP (protocol login limit).
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isIpBlocked(ip)) {
    return withCors(
      NextResponse.json({ error: "IP temporarily blocked" }, { status: 403 }),
      req
    );
  }

  const rl = rateLimit(clientKey(req, "otp:send"), 5, 15 * 60_000);
  const headers = rateLimitHeaders(rl);
  if (!rl.ok) {
    recordFailedAuth(ip, "otp_send_rate");
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

  const parsed = otpSendSchema.safeParse(raw);
  if (!parsed.success) {
    return withCors(
      NextResponse.json(
        { error: "Valid E.164 phone required" },
        { status: 400, headers }
      ),
      req
    );
  }

  const phone = parsed.data.phone;

  if (!isSupabaseConfigured()) {
    return withCors(
      NextResponse.json(
        {
          mode: "mock",
          sent: true,
          phone,
          hint: "Use code 000000",
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
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) {
    console.error("[otp/send]", error.message);
    recordFailedAuth(ip, "otp_send");
    const unsupported =
      /unsupported phone provider|phone provider/i.test(error.message);
    return withCors(
      NextResponse.json(
        {
          error: "Could not send code",
          hint: unsupported
            ? "Configure Twilio under Supabase Auth → Phone. Until then use mock: unset SUPABASE_* or use code 000000 when mode=mock."
            : undefined,
        },
        { status: 502, headers }
      ),
      req
    );
  }

  return withCors(
    NextResponse.json({ mode: "live", sent: true, phone }, { headers }),
    req
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
