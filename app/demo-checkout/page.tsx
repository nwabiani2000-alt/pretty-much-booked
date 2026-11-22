"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DemoCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const target = searchParams.get("target") || "checkout";
  const market = searchParams.get("market") || "london";
  
  useEffect(() => {
    // Set market in localStorage
    if (market === "lagos") {
      localStorage.setItem("pmb_market", "lagos");
    } else {
      localStorage.setItem("pmb_market", "london");
    }
    
    // Seed a demo booking for checkout
    const booking = {
      id: "demo-1",
      proId: "1",
      serviceId: "box-braids",
      proName: "Aisha B.",
      proInitials: "AB",
      proAvatarTone: "from-[#EDE9FE] to-[#DDD6FE]",
      proPhone: "+44 7700 90001",
      serviceName: "Box Braids",
      serviceIcon: "💇‍♀️",
      serviceCategory: "Hair",
      scheduledAt: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
      address: "42 Curtain Road, Shoreditch, Lagos",
      notes: null,
      styleNotes: "Soft glam, waist length",
      inspirationLabels: ["Soft glam"],
      isEmergency: false,
      travelZone: "island",
      travelFee: 0,
      tipAmount: 0,
      prepAcknowledged: true,
      guestCount: 1,
      escrow: market === "lagos",
      servicePrice: 85,
      emergencyFee: 0,
      durationMins: 180,
      totalPrice: 85,
      depositAmount: 25.5,
      depositPaid: target === "confirmation",
      trackingStatus: target === "confirmation" ? "pending" : undefined,
    };
    
    sessionStorage.setItem(`pmb_booking_demo-1`, JSON.stringify(booking));
    
    // Redirect to target
    if (target === "confirmation") {
      router.push("/booking/demo-1/confirmation");
    } else {
      router.push("/booking/demo-1/checkout");
    }
  }, [router, target, market]);
  
  return <div style={{ padding: "20px", textAlign: "center" }}>Loading demo {target} for {market}...</div>;
}
