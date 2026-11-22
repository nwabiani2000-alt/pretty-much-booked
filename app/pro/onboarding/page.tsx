"use client";

import { ProOnboardingClient } from "@/components/pro/ProOnboardingClient";
import { Suspense } from "react";

export default function ProOnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md space-y-4 px-6 pt-20">
          <div className="skeleton h-8 w-40 rounded" />
          <div className="skeleton h-40 w-full rounded" />
        </main>
      }
    >
      <ProOnboardingClient />
    </Suspense>
  );
}
