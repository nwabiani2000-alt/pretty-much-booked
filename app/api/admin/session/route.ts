import {
  ADMIN_COOKIE,
  isAdminDemoMode,
  verifyAdminToken,
} from "@/lib/admin-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  const ok = verifyAdminToken(token);
  return NextResponse.json({
    authenticated: ok,
    demo: isAdminDemoMode(),
  });
}
