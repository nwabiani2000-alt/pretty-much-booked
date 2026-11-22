import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";

/**
 * Protect /admin/* (except /admin/login) with admin session cookie.
 * Booking pages rely on sessionStorage + API access_token (checked in API).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!verifyAdminToken(token)) {
      const login = req.nextUrl.clone();
      login.pathname = "/admin/login";
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  // Soft gate: /bookings without any hint still renders client page;
  // API IDOR is enforced server-side. Redirect unauthenticated API already 401.

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
