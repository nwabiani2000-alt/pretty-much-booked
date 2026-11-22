import { isSupabaseConfigured } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

/**
 * Auth doctor — never returns secret values.
 * Phone OTP goes through Supabase; Twilio is configured in the Supabase project
 * (Auth → Providers → Phone), not as TWILIO_* on this app unless you add a
 * custom SMS hook later.
 */
export async function GET() {
  const supabaseEnabled = isSupabaseConfigured();
  const twilioHint =
    "Supabase Dashboard → Authentication → Providers → Phone → Twilio. " +
    "Needs TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and a Messaging Service SID " +
    "(or From number) in Supabase. App env: SUPABASE_URL + SUPABASE_ANON_KEY.";

  return NextResponse.json({
    supabaseEnabled,
    mode: supabaseEnabled ? "live" : "mock",
    channel: "phone_otp",
    doctor: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL?.trim()),
      SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY?.trim()),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
      ),
      mockOtpWhenUnauth: !supabaseEnabled,
      mockCode: "000000",
      twilio: {
        configuredIn: "supabase_dashboard",
        appReadsTwilioEnv: false,
        setup: twilioHint,
      },
    },
  });
}
