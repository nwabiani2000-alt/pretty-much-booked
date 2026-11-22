import { getPro } from "@/lib/api-catalog";
import { marketMeta, pricePros, resolveMarketQuery } from "@/lib/api-market";
import { corsPreflight, withCors } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/pros/[id]?market=lagos|london&currency=NGN|GBP */
export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const marketId = resolveMarketQuery(req.nextUrl.searchParams);
  const { data, mode } = await getPro(id);
  if (!data) {
    return withCors(
      NextResponse.json({ error: "Pro not found", mode }, { status: 404 }),
      req
    );
  }
  const [pro] = pricePros([data], marketId);
  return withCors(
    NextResponse.json({ mode, market: marketMeta(marketId), pro }),
    req
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
