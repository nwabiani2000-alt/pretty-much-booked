import {
  ADMIN_COOKIE,
  getAdminSecret,
  isAdminDemoMode,
  mintAdminToken,
} from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

/** POST { secret } → sets httpOnly cookie when secret matches. */
export async function POST(req: NextRequest) {
  let body: { secret?: string } = {};
  try {
    body = (await req.json()) as { secret?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const provided = body.secret?.trim() ?? "";
  const expected = getAdminSecret();
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Wrong secret" }, { status: 401 });
  }

  const token = mintAdminToken(expected);
  const res = NextResponse.json({
    ok: true,
    demo: isAdminDemoMode(),
  });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
