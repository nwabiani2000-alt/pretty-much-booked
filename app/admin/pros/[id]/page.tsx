"use client";

import { Button, TextLink } from "@/components/ui/Button";
import {
  getAdminPro,
  setProVetStatus,
  type AdminPro,
} from "@/lib/admin";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminProDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pro, setPro] = useState<AdminPro | null | undefined>(undefined);

  useEffect(() => {
    setPro(getAdminPro(params.id) ?? null);
  }, [params.id]);

  if (pro === undefined) {
    return (
      <main className="mx-auto max-w-md space-y-4 px-6 pt-20">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="skeleton h-32 w-full rounded" />
      </main>
    );
  }

  if (!pro) {
    return (
      <main className="mx-auto max-w-md px-6 py-12">
        <p className="text-sm text-brand-muted">Pro not found.</p>
        <Link href="/admin/pros" className="mt-4 inline-block text-sm text-brand-muted">
          Back
        </Link>
      </main>
    );
  }

  const pending = pro.status === "pending";

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-28 pt-5">
      <div className="flex items-center justify-between">
        <Link href="/admin/pros" className="text-sm text-brand-muted">
          Back
        </Link>
        <Image
          src="/images/logo-icon-purple.png"
          alt=""
          width={24}
          height={24}
        />
      </div>

      <p className="mt-10 text-sm capitalize text-brand-purple">{pro.status}</p>
      <h1 className="mt-2 font-display text-[2rem] font-bold text-black">
        {pro.displayName}
      </h1>
      <p className="mt-2 text-sm text-brand-muted">{pro.phone}</p>
      <p className="mt-1 text-sm text-brand-muted">
        {pro.specialties.join(" · ")} · {pro.city}
      </p>
      <p className="mt-6 text-base text-black">
        {pro.servicesCount} services · {pro.radiusKm} km
      </p>
      <p className="mt-1 text-sm text-brand-muted">
        Submitted {pro.submittedAt}
      </p>

      {pending && (
        <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
          <div className="mx-auto max-w-md">
            <Button
              type="button"
              onClick={() => {
                setProVetStatus(pro.id, "approved");
                setPro({ ...pro, status: "approved" });
                window.setTimeout(() => router.push("/admin/pros"), 400);
              }}
            >
              Approve
            </Button>
            <div className="mt-4 text-center">
              <TextLink
                onClick={() => {
                  setProVetStatus(pro.id, "rejected");
                  router.push("/admin/pros");
                }}
              >
                Reject
              </TextLink>
            </div>
          </div>
        </div>
      )}

      {!pending && (
        <div className="mt-12">
          <Link href="/admin/pros" className="text-sm text-brand-muted">
            Back to list
          </Link>
        </div>
      )}
    </main>
  );
}
