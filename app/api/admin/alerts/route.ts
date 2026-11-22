import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import {
  getAlertSnapshot,
  recordSentryError,
  recordStripeFail,
  recordSupabaseQuery,
  sendAlertEmail,
} from "@/lib/security/alerts";
import { listIncidents } from "@/lib/security/incident-log";
import { listBlockedIps } from "@/lib/security/ip-block";
import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** GET — snapshot of counters, blocked IPs, recent incidents. */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) return unauthorized();

  return NextResponse.json({
    ok: true,
    alerts: getAlertSnapshot(),
    blockedIps: listBlockedIps(),
    incidents: listIncidents(30),
  });
}

/**
 * POST — record a counter tick or send a test alert.
 * Body: { action: "sentry"|"stripe_fail"|"supabase_q"|"test_email", n?: number }
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) return unauthorized();

  let body: { action?: string; n?: number } = {};
  try {
    body = (await req.json()) as { action?: string; n?: number };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const n = Math.max(1, Math.min(500, Number(body.n) || 1));
  switch (body.action) {
    case "sentry":
      recordSentryError(n);
      break;
    case "stripe_fail":
      recordStripeFail(n);
      break;
    case "supabase_q":
      recordSupabaseQuery(n);
      break;
    case "test_email":
      sendAlertEmail("PMB alert test", "Manual test from /api/admin/alerts");
      break;
    default:
      return NextResponse.json(
        {
          error: "Unknown action",
          hint: "sentry | stripe_fail | supabase_q | test_email",
        },
        { status: 400 }
      );
  }

  return NextResponse.json({
    ok: true,
    alerts: getAlertSnapshot(),
  });
}
