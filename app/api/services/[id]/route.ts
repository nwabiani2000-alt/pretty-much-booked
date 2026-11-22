import { getService } from "@/lib/api-catalog";
import {
  marketMeta,
  priceServices,
  resolveMarketQuery,
} from "@/lib/api-market";
import { corsPreflight, withCors } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string } };

/** GET /api/services/[id]?market=lagos|london&currency=NGN|GBP */
export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = ctx.params;
  const marketId = resolveMarketQuery(req.nextUrl.searchParams);
  const { data, mode } = await getService(id);
  if (!data) {
    return withCors(
      NextResponse.json({ error: "Service not found", mode }, { status: 404 }),
      req
    );
  }
  const [service] = priceServices([data], marketId);
  return withCors(
    NextResponse.json({ mode, market: marketMeta(marketId), service }),
    req
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
