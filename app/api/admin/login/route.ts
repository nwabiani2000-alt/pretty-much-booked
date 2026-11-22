import {
  ADMIN_COOKIE,
  getAdminSecret,
  isAdminDemoMode,
  mintAdminToken,
} from "@/lib/admin-auth";
import {
  clientKey,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";

/** POST { secret } → sets httpOnly cookie when secret matches. */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "admin:login"), 5, 15 * 60_000);
  const headers = rateLimitHeaders(rl);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts" },
      { status: 429, headers }
    );
  }

  let body: { secret?: string } = {};
  try {
    body = (await req.json()) as { secret?: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers }
    );
  }

  const provided = body.secret?.trim() ?? "";
  const expected = getAdminSecret();
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json(
      { error: "Wrong secret" },
      { status: 401, headers }
    );
  }

  const token = mintAdminToken(expected);
  const res = NextResponse.json(
    {
      ok: true,
      demo: isAdminDemoMode(),
    },
    { headers }
  );
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
