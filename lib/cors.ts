import { NextResponse } from "next/server";

/** Allow Expo web / native clients on other origins to hit API routes. */
const ALLOW_HEADERS = "Content-Type, Authorization";

export function withCors(res: NextResponse, req?: Request): NextResponse {
  const origin = req?.headers.get("origin") ?? "*";
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", ALLOW_HEADERS);
  res.headers.set("Vary", "Origin");
  return res;
}

export function corsPreflight(req: Request): NextResponse {
  return withCors(new NextResponse(null, { status: 204 }), req);
}
