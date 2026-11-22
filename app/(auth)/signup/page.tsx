import { PhoneOtpForm } from "@/components/auth/PhoneOtpForm";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-screen max-w-md bg-neutral-bg px-5 pt-20">
          <div className="skeleton h-40 w-full rounded-card" />
        </main>
      }
    >
      <PhoneOtpForm mode="signup" />
    </Suspense>
  );
}
