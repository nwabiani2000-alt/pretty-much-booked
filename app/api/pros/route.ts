import { listPros } from "@/lib/api-catalog";
import { marketMeta, pricePros, resolveMarketQuery } from "@/lib/api-market";
import { corsPreflight, withCors } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/pros?serviceId=box-braids&market=lagos|london&currency=NGN|GBP */
export async function GET(req: NextRequest) {
  const serviceId = req.nextUrl.searchParams.get("serviceId") ?? undefined;
  const marketId = resolveMarketQuery(req.nextUrl.searchParams);
  const { data, mode } = await listPros({ serviceId });
  return withCors(
    NextResponse.json({
      mode,
      market: marketMeta(marketId),
      count: data.length,
      pros: pricePros(data, marketId),
    }),
    req
  );
}

export async function OPTIONS(req: Request) {
  return corsPreflight(req);
}
