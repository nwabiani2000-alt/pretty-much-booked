"use client";

import { Button, TextLink } from "@/components/ui/Button";
import {
  getDispute,
  resolveDispute,
  type AdminDispute,
} from "@/lib/admin";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDisputeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [dispute, setDispute] = useState<AdminDispute | null | undefined>(
    undefined
  );
  const [note, setNote] = useState("");
  const [showResolve, setShowResolve] = useState(false);

  useEffect(() => {
    setDispute(getDispute(params.id) ?? null);
  }, [params.id]);

  if (dispute === undefined) {
    return (
      <main className="mx-auto max-w-md space-y-4 px-6 pt-20">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="skeleton h-32 w-full rounded" />
      </main>
    );
  }

  if (!dispute) {
    return (
      <main className="mx-auto max-w-md px-6 py-12">
        <p className="text-sm text-brand-muted">Dispute not found.</p>
        <Link
          href="/admin/disputes"
          className="mt-4 inline-block text-sm text-brand-muted"
        >
          Back
        </Link>
      </main>
    );
  }

  const open = dispute.status === "open";

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-6 pb-28 pt-5">
      <div className="flex items-center justify-between">
        <Link href="/admin/disputes" className="text-sm text-brand-muted">
          Back
        </Link>
        <Image
          src="/images/logo-icon-purple.png"
          alt=""
          width={24}
          height={24}
        />
      </div>

      <p className="mt-10 text-sm capitalize text-brand-purple">
        {dispute.status}
      </p>
      <h1 className="mt-2 font-display text-[2rem] font-bold text-black">
        {dispute.serviceName}
      </h1>
      <p className="mt-2 text-base text-black">
        {dispute.customerName} · {dispute.proName}
      </p>
      <p className="mt-1 text-sm text-brand-muted">
        Booking {dispute.bookingId} · {dispute.openedAt}
      </p>

      <p className="mt-8 text-3xl font-bold text-black">£{dispute.amount}</p>
      <p className="mt-6 text-base leading-relaxed text-black">
        {dispute.reason}
      </p>

      {dispute.resolutionNote && (
        <p className="mt-6 text-sm text-brand-muted">
          Resolution: {dispute.resolutionNote}
        </p>
      )}

      {open && !showResolve && (
        <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
          <div className="mx-auto max-w-md">
            <Button type="button" onClick={() => setShowResolve(true)}>
              Resolve
            </Button>
          </div>
        </div>
      )}

      {open && showResolve && (
        <div className="animate-slide-in mt-10">
          <p className="text-sm text-brand-muted">Note</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Refund / warn / close"
            rows={3}
            className="input-underline mt-2 resize-none"
          />
          <div className="fixed inset-x-0 bottom-0 bg-white px-6 py-4">
            <div className="mx-auto max-w-md">
              <Button
                type="button"
                onClick={() => {
                  const resolution =
                    note.trim() || "Resolved · no further action";
                  resolveDispute(dispute.id, resolution);
                  setDispute({
                    ...dispute,
                    status: "resolved",
                    resolutionNote: resolution,
                  });
                  window.setTimeout(() => router.push("/admin/disputes"), 500);
                }}
              >
                Confirm resolve
              </Button>
              <div className="mt-4 text-center">
                <TextLink onClick={() => setShowResolve(false)}>
                  Cancel
                </TextLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
