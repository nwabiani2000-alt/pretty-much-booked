import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { getAdminEpoch } from "@/lib/security/session-epoch";

/**
 * Protect /admin/* (except /admin/login) with admin session cookie.
 * Epoch check invalidates cookies after emergency logout (same isolate).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    // Touch epoch so Edge isolate shares process bump when applicable
    void getAdminEpoch();
    if (!verifyAdminToken(token)) {
      const login = req.nextUrl.clone();
      login.pathname = "/admin/login";
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
