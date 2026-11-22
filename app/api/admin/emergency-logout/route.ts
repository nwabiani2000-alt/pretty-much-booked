import {
  ADMIN_COOKIE,
  verifyAdminToken,
} from "@/lib/admin-auth";
import { emergencyInvalidateAllSessions } from "@/lib/security/session-invalidate";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/emergency-logout
 * Body: { confirm: "EMERGENCY_LOGOUT" }
 * Requires admin session cookie. Invalidates all sessions + logs P1 incident.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { confirm?: string } = {};
  try {
    body = (await req.json()) as { confirm?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.confirm !== "EMERGENCY_LOGOUT") {
    return NextResponse.json(
      {
        error: 'Confirmation required',
        hint: 'Send { "confirm": "EMERGENCY_LOGOUT" }',
      },
      { status: 400 }
    );
  }

  const result = await emergencyInvalidateAllSessions("admin_api");

  const res = NextResponse.json({
    ok: true,
    ...result,
    note: "Admin cookies cleared; re-login required. Supabase sign-out is best-effort when service role is configured.",
  });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
