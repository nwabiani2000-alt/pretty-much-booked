"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function DemoAdminKycPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Set pending KYC in localStorage
    const kycState = {
      idUploaded: true,
      selfieUploaded: true,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem("pmb_pro_kyc", JSON.stringify(kycState));
  }, []);
  
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-12 pt-5">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push("/")} className="text-sm text-brand-muted">
          Back
        </button>
        <Image
          src="/images/logo-icon-purple.png"
          alt=""
          width={24}
          height={24}
        />
      </div>

      <h1 className="mt-10 font-display text-[2rem] font-bold text-black">
        Pros
      </h1>
      <p className="mt-2 text-sm text-brand-muted">
        3 pending · KYC pending verification
      </p>
      <p className="mt-4 rounded-button bg-brand-purple/10 px-3 py-3 text-sm text-brand-purple">
        A pro submitted ID + selfie stubs — Pending verification
      </p>

      <section className="mt-10">
        <h2 className="text-xs font-bold uppercase tracking-wide text-brand-muted">
          Pending
        </h2>
        <ul className="mt-4 space-y-3">
          <li className="flex items-start gap-3 rounded-card bg-neutral-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-200 to-purple-100 text-sm font-bold text-purple-900">
              AO
            </div>
            <div className="flex-1">
              <p className="font-semibold text-black">Ada Okoro</p>
              <p className="mt-1 text-xs text-brand-muted">
                Hair · +2348012345678
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-card bg-neutral-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-200 to-purple-100 text-sm font-bold text-purple-900">
              CJ
            </div>
            <div className="flex-1">
              <p className="font-semibold text-black">Chioma Jones</p>
              <p className="mt-1 text-xs text-brand-muted">
                Nails · +447700900123
              </p>
            </div>
          </li>
        </ul>
      </section>
    </main>
  );
}
