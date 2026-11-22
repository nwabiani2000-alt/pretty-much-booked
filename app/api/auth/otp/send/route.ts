import { corsPreflight, withCors } from "@/lib/cors";
import { getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

type Body = { phone?: string };

/**
 * POST /api/auth/otp/send
 * Live: Supabase signInWithOtp({ phone }).
 * Mock: ack without SMS when SUPABASE_* missing.
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
  if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone)) {
    return withCors(
      NextResponse.json(
        { error: "Valid E.164 phone required" },
        { status: 400 }
      ),
      req
    );
  }

  if (!isSupabaseConfigured()) {
    return withCors(
      NextResponse.json({
        mode: "mock",
        sent: true,
        phone,
        hint: "Use code 000000",
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

  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) {
    console.error("[otp/send]", error.message);
    const unsupported =
      /unsupported phone provider|phone provider/i.test(error.message);
    return withCors(
      NextResponse.json(
        {
          error: error.message,
          hint: unsupported
            ? "Configure Twilio under Supabase Auth → Phone. Until then use mock: unset SUPABASE_* or use code 000000 when mode=mock."
            : undefined,
          doctor: unsupported
            ? {
                step: "supabase_phone_twilio",
                needs: [
                  "TWILIO_ACCOUNT_SID",
                  "TWILIO_AUTH_TOKEN",
                  "TWILIO_MESSAGE_SERVICE_SID",
                ],
                where: "Supabase Dashboard → Auth → Providers → Phone",
              }
            : undefined,
        },
        { status: 502 }
      ),
      req
    );
  }

  return withCors(
    NextResponse.json({ mode: "live", sent: true, phone }),
    req
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
