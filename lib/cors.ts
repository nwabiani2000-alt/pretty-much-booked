import { NextResponse } from "next/server";

/** Allow Expo web / native clients on other origins to hit API routes. */
const ALLOW_HEADERS = "Content-Type, Authorization, X-PMB-User-Id, X-PMB-Access-Token";

function allowedOrigins(): string[] {
  const raw = process.env.CORS_ALLOWED_ORIGINS?.trim();
  if (raw) {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (process.env.NODE_ENV === "production") {
    return [
      "https://prettymuchbooked.com",
      "https://www.prettymuchbooked.com",
      "https://pretty-much-booked.vercel.app",
    ];
  }
  // Dev: reflect localhost / Expo
  return ["*"];
}

function resolveOrigin(req?: Request): string | null {
  const requestOrigin = req?.headers.get("origin");
  const allowed = allowedOrigins();
  if (allowed.includes("*")) {
    return requestOrigin || "*";
  }
  if (requestOrigin && allowed.includes(requestOrigin)) {
    return requestOrigin;
  }
  // No Origin (same-origin / curl) — omit ACAO or use first allowed
  return null;
}

export function withCors(res: NextResponse, req?: Request): NextResponse {
  const origin = resolveOrigin(req);
  if (origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
  res.headers.set("Vary", "Origin");
  return res;
}

export function corsPreflight(req: Request): NextResponse {
  return withCors(new NextResponse(null, { status: 204 }), req);
}
