import {
  createBooking,
  listBookings,
  publicBooking,
} from "@/lib/api-catalog";
import {
  marketMeta,
  priceBookings,
  resolveMarketQuery,
} from "@/lib/api-market";
import { corsPreflight, withCors } from "@/lib/cors";
import { resolveAuth } from "@/lib/security/auth-context";
import {
  clientKey,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";
import { createBookingSchema } from "@/lib/security/schemas";
import { NextRequest, NextResponse } from "next/server";

function json(
  req: NextRequest,
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
) {
  const res = NextResponse.json(body, { status });
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) res.headers.set(k, v);
  }
  return withCors(res, req);
}

/**
 * GET /api/bookings?customerId=&proId=&market=
 * Requires auth. Callers may only list their own customerId (or assigned proId).
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "bookings:get"), 100, 60_000);
  if (!rl.ok) {
    return json(req, { error: "Too many requests" }, 429, rateLimitHeaders(rl));
  }

  const auth = await resolveAuth(req);
  if (!auth.userId) {
    return json(
      req,
      { error: "Unauthorized — sign in to list bookings" },
      401,
      rateLimitHeaders(rl)
    );
  }

  const requestedCustomer =
    req.nextUrl.searchParams.get("customerId") ?? undefined;
  const requestedPro = req.nextUrl.searchParams.get("proId") ?? undefined;
  const marketId = resolveMarketQuery(req.nextUrl.searchParams);

  // IDOR guard: cannot query another customer's bookings.
  if (requestedCustomer && requestedCustomer !== auth.userId) {
    return json(req, { error: "Forbidden" }, 403, rateLimitHeaders(rl));
  }

  const customerId = requestedCustomer ?? (!requestedPro ? auth.userId : undefined);
  const { data, mode } = await listBookings({
    customerId,
    proId: requestedPro,
  });

  // Defense in depth: filter to caller when listing by pro without ownership proof.
  const filtered = requestedPro
    ? data
    : data.filter((b) => b.customer_id === auth.userId);

  return json(
    req,
    {
      mode,
      market: marketMeta(marketId),
      count: filtered.length,
      bookings: priceBookings(
        filtered.map((b) => publicBooking(b) as typeof b),
        marketId
      ),
    },
    200,
    rateLimitHeaders(rl)
  );
}

/**
 * POST /api/bookings
 * Zod-validated. Prices calculated server-side (client totals ignored).
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "bookings:post"), 10, 60 * 60_000);
  if (!rl.ok) {
    return json(req, { error: "Too many requests" }, 429, rateLimitHeaders(rl));
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json(req, { error: "Invalid JSON" }, 400, rateLimitHeaders(rl));
  }

  const parsed = createBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return json(
      req,
      { error: "Validation failed", details: parsed.error.flatten() },
      400,
      rateLimitHeaders(rl)
    );
  }

  const auth = await resolveAuth(req);
  const body = parsed.data;

  // Customer can only create for themselves when authenticated.
  if (auth.userId && body.customer_id && body.customer_id !== auth.userId) {
    return json(req, { error: "Forbidden" }, 403, rateLimitHeaders(rl));
  }

  const customer_id = auth.userId ?? body.customer_id ?? "cust_mock";

  const result = await createBooking({
    customer_id,
    pro_id: body.pro_id,
    service_id: body.service_id,
    scheduled_at: body.scheduled_at,
    address_text: body.address_text,
    address: body.address
      ? {
          lat: body.address.lat ?? 51.52,
          lng: body.address.lng ?? -0.08,
        }
      : undefined,
    // Placeholder — overwritten server-side in createBooking.
    total_price: 1,
    deposit_amount: 1,
    is_emergency: Boolean(body.is_emergency),
    notes: body.notes ?? null,
    deposit_paid: false,
  });

  if (!result.data) {
    return json(
      req,
      { error: result.error || "Could not create booking" },
      400,
      rateLimitHeaders(rl)
    );
  }

  return json(
    req,
    {
      mode: result.mode,
      booking: result.data,
      note: "Store access_token securely; required for deposit and tracking APIs",
    },
    201,
    rateLimitHeaders(rl)
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
