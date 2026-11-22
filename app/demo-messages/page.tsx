"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoMessagesPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Seed a booking 2 hours in the future to show timed chat
    const scheduledTime = new Date();
    scheduledTime.setHours(scheduledTime.getHours() + 2);
    
    const booking = {
      id: "demo-msg",
      proId: "1",
      serviceId: "box-braids",
      proName: "Aisha B.",
      proInitials: "AB",
      proAvatarTone: "from-[#EDE9FE] to-[#DDD6FE]",
      proPhone: "+44 7700 90001",
      serviceName: "Box Braids",
      serviceIcon: "💇‍♀️",
      scheduledAt: scheduledTime.toISOString(),
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
      confirmedAt: new Date().toISOString(),
    };
    
    sessionStorage.setItem(`pmb_booking_demo-msg`, JSON.stringify(booking));
    
    // Redirect to messages
    router.push("/messages?booking=demo-msg");
  }, [router]);
  
  return <div style={{ padding: "20px", textAlign: "center" }}>Loading messages demo...</div>;
}
