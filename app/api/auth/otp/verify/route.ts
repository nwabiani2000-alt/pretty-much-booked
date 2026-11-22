import { corsPreflight, withCors } from "@/lib/cors";
import { getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

type Body = { phone?: string; token?: string };

/**
 * POST /api/auth/otp/verify
 * Live: verifyOtp phone/sms.
 * Mock: accept 000000 (or any 6 digits) when keys missing.
 */
export async function POST(req: NextRequest) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return withCors(
      NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
      req
    );
  }

  const phone = body.phone?.trim();
  const token = body.token?.trim();

  if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone)) {
    return withCors(
      NextResponse.json(
        { error: "Valid E.164 phone required" },
        { status: 400 }
      ),
      req
    );
  }
  if (!token || !/^\d{6}$/.test(token)) {
    return withCors(
      NextResponse.json({ error: "6-digit code required" }, { status: 400 }),
      req
    );
  }

  if (!isSupabaseConfigured()) {
    return withCors(
      NextResponse.json({
        mode: "mock",
        verified: true,
        session: {
          phone,
          userId: `mock_${phone.replace(/\D/g, "").slice(-8)}`,
          mode: "mock" as const,
        },
      }),
      req
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return withCors(
      NextResponse.json({ error: "Supabase unavailable" }, { status: 503 }),
      req
    );
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    console.error("[otp/verify]", error.message);
    return withCors(
      NextResponse.json({ error: error.message }, { status: 401 }),
      req
    );
  }

  return withCors(
    NextResponse.json({
      mode: "live",
      verified: true,
      session: {
        phone,
        userId: data.user?.id ?? "unknown",
        mode: "live" as const,
        accessToken: data.session?.access_token,
      },
    }),
    req
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
