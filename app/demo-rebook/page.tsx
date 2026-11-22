"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemoRebookPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Seed a saved look for rebook
    const savedLook = {
      proId: "1",
      proName: "Aisha B.",
      serviceId: "box-braids",
      serviceName: "Box Braids",
      styleNotes: "Soft glam, waist length",
      inspirationLabels: ["Soft glam"],
      savedAt: new Date().toISOString(),
    };
    
    localStorage.setItem("pmb_saved_look", JSON.stringify(savedLook));
    
    // Redirect to home
    router.push("/book");
  }, [router]);
  
  return <div style={{ padding: "20px", textAlign: "center" }}>Loading rebook demo...</div>;
}
