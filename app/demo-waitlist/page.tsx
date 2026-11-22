"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoWaitlistPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Seed a cancelled booking to show waitlist
    const booking = {
      id: "bk_demo_track",
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
      trackingStatus: "pending",
      confirmedAt: undefined,
      cancelledAt: new Date().toISOString(),
      waitlistJoined: false,
    };
    
    sessionStorage.setItem(`pmb_booking_bk_demo_track`, JSON.stringify(booking));
    
    // Redirect to tracking
    router.push("/bookings/bk_demo_track");
  }, [router]);
  
  return <div style={{ padding: "20px", textAlign: "center" }}>Loading waitlist demo...</div>;
}
