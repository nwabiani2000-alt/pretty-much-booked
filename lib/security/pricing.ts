import { getPro, getService } from "@/lib/api-catalog";

const EMERGENCY_FEE_GBP = 15;
const DEPOSIT_RATIO = 0.3;

export type ServerPrice = {
  total_price: number;
  deposit_amount: number;
  service_price: number;
  emergency_fee: number;
};

/**
 * Never trust client-provided prices. Resolve from catalog / pro offerings.
 */
export async function calculateBookingPrice(opts: {
  proId: string;
  serviceId: string;
  isEmergency?: boolean;
}): Promise<ServerPrice | null> {
  const [{ data: pro }, { data: service }] = await Promise.all([
    getPro(opts.proId),
    getService(opts.serviceId),
  ]);
  if (!pro || !service) return null;

  const offering = pro.offerings?.[opts.serviceId];
  const servicePrice = Number(
    offering?.price ?? service.base_price ?? 0
  );
  if (!Number.isFinite(servicePrice) || servicePrice <= 0) return null;

  const emergency_fee = opts.isEmergency ? EMERGENCY_FEE_GBP : 0;
  const total_price = Math.round((servicePrice + emergency_fee) * 100) / 100;
  const deposit_amount = Math.round(total_price * DEPOSIT_RATIO * 100) / 100;

  return {
    total_price,
    deposit_amount,
    service_price: servicePrice,
    emergency_fee,
  };
}

export { EMERGENCY_FEE_GBP, DEPOSIT_RATIO };
