/**
 * Lagos WhatsApp confirm bridge — deep-link only (no Twilio).
 */

import type { MarketId } from "@/lib/market";

/** Public demo number — replace with ops WA business number. */
export const LAGOS_WA_NUMBER = "2348012345678";

export function shouldOfferWhatsApp(marketId: MarketId): boolean {
  return marketId === "lagos";
}

export function whatsappConfirmUrl(opts: {
  bookingId: string;
  serviceName: string;
  proName: string;
  whenLabel: string;
  address: string;
}): string {
  const text = [
    `Pretty Much Booked — confirm booking ${opts.bookingId}`,
    `${opts.serviceName} with ${opts.proName}`,
    opts.whenLabel,
    opts.address,
  ].join("\n");
  return `https://wa.me/${LAGOS_WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
