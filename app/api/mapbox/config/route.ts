import { getMapboxAccessToken, isMapboxConfigured } from "@/lib/mapbox-server";
import { NextResponse } from "next/server";

/**
 * Exposes Mapbox public access token to the client without NEXT_PUBLIC_ binding.
 * When unset, clients keep the placeholder tracking map.
 */
export async function GET() {
  const accessToken = getMapboxAccessToken();
  const enabled = isMapboxConfigured();

  return NextResponse.json({
    accessToken: accessToken || null,
    mapboxEnabled: enabled,
    mode: enabled ? "live" : "mock",
    doctor: {
      MAPBOX_ACCESS_TOKEN: enabled,
      liveGlPath: enabled,
      mockFallback: !enabled,
    },
  });
}
