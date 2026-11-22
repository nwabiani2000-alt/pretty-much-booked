"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestSeedPage() {
  const router = useRouter();
  
  useEffect(() => {
    const bookingData = {
      id: "bk_pmb13",
      proId: "pro_1",
      serviceId: "svc_1",
      proName: "Alex Rivera",
      serviceName: "House Clean",
      scheduledAt: "2026-11-23T14:00:00.000Z",
      address: "12 King St, London",
      isEmergency: false,
      servicePrice: 80,
      emergencyFee: 0,
      durationMins: 90,
      totalPrice: 80,
      depositAmount: 20,
    };
    sessionStorage.setItem("pmb_booking_bk_pmb13", JSON.stringify(bookingData));
    setTimeout(() => {
      router.push("/booking/bk_pmb13/checkout");
    }, 500);
  }, [router]);

  return <div style={{ padding: "2rem" }}>Seeding booking data...</div>;
}
