"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function DemoPushPage() {
  const [showToast, setShowToast] = useState(false);
  
  useEffect(() => {
    // Enable push
    localStorage.setItem("pmb_push_enabled", "true");
    
    // Add mock push to log
    const log = [{
      title: "Pro on the way",
      body: "Your stylist is heading over (mock).",
      at: new Date().toISOString(),
    }];
    localStorage.setItem("pmb_push_log", JSON.stringify(log));
    
    // Show toast
    setTimeout(() => setShowToast(true), 300);
  }, []);
  
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-neutral-bg px-5 pb-28 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-display text-neutral-text">You</h1>
        <div className="flex items-center gap-2">
          <span className="text-small text-neutral-secondary">London £</span>
          <span className="rounded-full bg-pmb-50 px-3 py-1 text-small font-medium text-pmb-700">
            Lagos ₦
          </span>
        </div>
      </div>

      <div className="card mt-6">
        <p className="text-caption text-neutral-muted">Push (stub)</p>
        <div className="mt-3 flex w-full items-center justify-between py-2">
          <span className="text-small font-medium text-neutral-text">
            Notifications
          </span>
          <span className="text-small text-pmb-700">On</span>
        </div>
        <button className="mt-2 text-small font-medium text-pmb-700 no-underline">
          Send mock push
        </button>
        <p className="mt-3 text-caption text-neutral-secondary">
          Last: Pro on the way · {new Date().toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
        </p>
        <p className="mt-3 text-caption text-neutral-muted">
          FCM / APNs later — prefs + log only.
        </p>
      </div>

      {showToast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-badge bg-neutral-text px-4 py-2 text-small text-white">
          Mock push logged
        </div>
      )}
      
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-top">
        <nav className="mx-auto flex max-w-md items-center justify-around px-4 py-2">
          <div className="flex flex-col items-center gap-1 py-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs text-neutral-secondary">Home</span>
          </div>
          <div className="flex flex-col items-center gap-1 py-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-neutral-secondary">Bookings</span>
          </div>
          <div className="relative -mt-6">
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-pmb-700 text-white shadow-lg">
              <span className="text-sm font-bold">Book</span>
            </button>
          </div>
          <div className="flex flex-col items-center gap-1 py-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs text-neutral-secondary">Messages</span>
          </div>
          <div className="flex flex-col items-center gap-1 py-2">
            <svg className="h-5 w-5 text-pmb-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium text-pmb-700">Profile</span>
          </div>
        </nav>
      </div>
    </main>
  );
}
