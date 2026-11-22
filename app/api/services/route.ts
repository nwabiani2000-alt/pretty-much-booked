import { listServices } from "@/lib/api-catalog";
import {
  marketMeta,
  priceServices,
  resolveMarketQuery,
} from "@/lib/api-market";
import { corsPreflight, withCors } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/services?category=hair&market=lagos|london&currency=NGN|GBP */
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? undefined;
  const marketId = resolveMarketQuery(req.nextUrl.searchParams);
  const { data, mode } = await listServices({ category });
  return withCors(
    NextResponse.json({
      mode,
      market: marketMeta(marketId),
      count: data.length,
      services: priceServices(data, marketId),
    }),
    req
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
