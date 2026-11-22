/**
 * Server-only Mapbox helpers.
 * Env (see .env.example):
 * - MAPBOX_ACCESS_TOKEN — public token, exposed to client via GET /api/mapbox/config only (not NEXT_PUBLIC_)
 */

export function getMapboxAccessToken(): string | null {
  return process.env.MAPBOX_ACCESS_TOKEN?.trim() || null;
}

export function isMapboxConfigured(): boolean {
  return Boolean(getMapboxAccessToken());
}
