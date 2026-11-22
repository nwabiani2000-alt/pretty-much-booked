"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoEscrowPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Set Lagos market
    localStorage.setItem("pmb_market", "lagos");
    
    // Seed a completed booking with escrow released
    const booking = {
      id: "bk_demo_track",
      proId: "1",
      serviceId: "box-braids",
      proName: "Aisha B.",
      proInitials: "AB",
      proAvatarTone: "from-[#EDE9FE] to-[#DDD6FE]",
      proPhone: "+234 801 234 5678",
      serviceName: "Box Braids",
      serviceIcon: "💇‍♀️",
      scheduledAt: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
      address: "Victoria Island, Lagos",
      notes: null,
      isEmergency: false,
      escrow: true,
      escrowStatus: "released",
      servicePrice: 85,
      emergencyFee: 0,
      durationMins: 180,
      totalPrice: 85,
      depositAmount: 25.5,
      depositPaid: true,
      trackingStatus: "completed",
      confirmedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    };
    
    sessionStorage.setItem(`pmb_booking_bk_demo_track`, JSON.stringify(booking));
    
    // Redirect to tracking
    router.push("/bookings/bk_demo_track");
  }, [router]);
  
  return <div style={{ padding: "20px", textAlign: "center" }}>Loading escrow demo...</div>;
}
