import { saveBooking, type StoredBooking } from "@/lib/booking-storage";

/** Seed a demo booking so tracking can be opened without checkout. */
export function ensureDemoBooking(id = "bk_demo_track"): StoredBooking {
  const existing =
    typeof window !== "undefined"
      ? (() => {
          try {
            const raw = sessionStorage.getItem(`pmb_booking_${id}`);
            return raw ? (JSON.parse(raw) as StoredBooking) : null;
          } catch {
            return null;
          }
        })()
      : null;

  if (existing) return existing;

  const booking: StoredBooking = {
    id,
    proId: "1",
    serviceId: "box-braids",
    proName: "Aisha B.",
    proInitials: "AB",
    proAvatarTone: "from-[#EDE9FE] to-[#DDD6FE]",
    proPhone: "+44 7700 90001",
    serviceName: "Box Braids",
    serviceIcon: "💇‍♀️",
    scheduledAt: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    address: "42 Curtain Road, Shoreditch, London EC2A 3NH",
    notes: null,
    isEmergency: false,
    servicePrice: 85,
    emergencyFee: 0,
    durationMins: 180,
    totalPrice: 85,
    depositAmount: 25.5,
    depositPaid: true,
    trackingStatus: "on_the_way",
    confirmedAt: new Date().toISOString(),
  };
  saveBooking(booking);
  return booking;
}
