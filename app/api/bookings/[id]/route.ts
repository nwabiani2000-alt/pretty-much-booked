import { getBookingById, publicBooking } from "@/lib/api-catalog";
import { corsPreflight, withCors } from "@/lib/cors";
import {
  resolveAuth,
  verifyBookingAccessToken,
} from "@/lib/security/auth-context";
import {
  clientKey,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

async function paramId(ctx: Ctx): Promise<string> {
  const p = await Promise.resolve(ctx.params);
  return p.id;
}

/**
 * GET /api/bookings/[id]
 * IDOR-safe: owner (auth userId) OR valid access_token required.
 */
export async function GET(req: NextRequest, ctx: Ctx) {
  const rl = rateLimit(clientKey(req, "bookings:id"), 60, 60_000);
  const headers = rateLimitHeaders(rl);
  if (!rl.ok) {
    return withCors(
      NextResponse.json({ error: "Too many requests" }, { status: 429, headers }),
      req
    );
  }

  const id = await paramId(ctx);
  const auth = await resolveAuth(req);
  const token =
    auth.accessToken ||
    req.nextUrl.searchParams.get("access_token") ||
    undefined;

  const { data, mode } = await getBookingById(id);
  if (!data) {
    return withCors(
      NextResponse.json({ error: "Not found" }, { status: 404, headers }),
      req
    );
  }

  const isOwner = Boolean(auth.userId && auth.userId === data.customer_id);
  const tokenOk =
    verifyBookingAccessToken(token, data.id, data.customer_id) ||
    (data.access_token && token === data.access_token);

  if (!isOwner && !tokenOk) {
    return withCors(
      NextResponse.json({ error: "Forbidden" }, { status: 403, headers }),
      req
    );
  }

  return withCors(
    NextResponse.json(
      { mode, booking: publicBooking(data) },
      { status: 200, headers }
    ),
    req
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
