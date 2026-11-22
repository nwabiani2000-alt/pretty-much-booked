import { createBooking, listBookings } from "@/lib/api-catalog";
import {
  marketMeta,
  priceBookings,
  resolveMarketQuery,
} from "@/lib/api-market";
import { corsPreflight, withCors } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/bookings?customerId=&proId=&market=lagos|london&currency=NGN|GBP */
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId") ?? undefined;
  const proId = req.nextUrl.searchParams.get("proId") ?? undefined;
  const marketId = resolveMarketQuery(req.nextUrl.searchParams);
  const { data, mode } = await listBookings({ customerId, proId });
  return withCors(
    NextResponse.json({
      mode,
      market: marketMeta(marketId),
      count: data.length,
      bookings: priceBookings(data, marketId),
    }),
    req
  );
}

/**
 * POST /api/bookings
 * Body: pro_id, service_id, scheduled_at, address_text, total_price, deposit_amount, …
 * Live insert only when UUID FKs present; otherwise mock store.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return withCors(
      NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
      req
    );
  }

  const pro_id = String(body.pro_id ?? "").trim();
  const service_id = String(body.service_id ?? "").trim();
  const scheduled_at = String(body.scheduled_at ?? "").trim();
  const address_text = String(body.address_text ?? "").trim();
  const total_price = Number(body.total_price);
  const deposit_amount = Number(body.deposit_amount);

  if (!pro_id || !service_id || !scheduled_at || !address_text) {
    return withCors(
      NextResponse.json(
        {
          error:
            "pro_id, service_id, scheduled_at, and address_text are required",
        },
        { status: 400 }
      ),
      req
    );
  }
  if (!Number.isFinite(total_price) || !Number.isFinite(deposit_amount)) {
    return withCors(
      NextResponse.json(
        { error: "total_price and deposit_amount required" },
        { status: 400 }
      ),
      req
    );
  }

  const result = await createBooking({
    customer_id: body.customer_id ? String(body.customer_id) : undefined,
    pro_id,
    service_id,
    scheduled_at,
    address_text,
    address: body.address as { lat: number; lng: number } | undefined,
    total_price,
    deposit_amount,
    is_emergency: Boolean(body.is_emergency),
    notes: body.notes != null ? String(body.notes) : null,
    deposit_paid: Boolean(body.deposit_paid),
  });

  if (!result.data) {
    return withCors(
      NextResponse.json(
        { error: result.error || "Could not create booking" },
        { status: 500 }
      ),
      req
    );
  }

  return withCors(
    NextResponse.json(
      { mode: result.mode, booking: result.data },
      { status: 201 }
    ),
    req
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
