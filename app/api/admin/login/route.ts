import {
  ADMIN_COOKIE,
  getAdminSecret,
  isAdminDemoMode,
  mintAdminToken,
} from "@/lib/admin-auth";
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
import { NextRequest, NextResponse } from "next/server";

/** POST { secret } → sets httpOnly cookie when secret matches. */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isIpBlocked(ip)) {
    return NextResponse.json(
      { error: "IP temporarily blocked" },
      { status: 403 }
    );
  }

  const rl = rateLimit(clientKey(req, "admin:login"), 5, 15 * 60_000);
  const headers = rateLimitHeaders(rl);
  if (!rl.ok) {
    recordFailedAuth(ip, "admin_login_rate");
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
    const { blocked, fails } = recordFailedAuth(ip, "admin_login");
    return NextResponse.json(
      {
        error: blocked ? "IP temporarily blocked" : "Wrong secret",
        fails,
      },
      { status: blocked ? 403 : 401, headers }
    );
  }

  clearFailedAuth(ip);
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
