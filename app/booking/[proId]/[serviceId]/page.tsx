import { BookingDetailsClient } from "@/components/booking/BookingDetailsClient";
import {
  getProById,
  getProServicePrice,
  getServiceById,
} from "@/lib/mock-pros";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type BookingPageProps = {
  params: Promise<{ proId: string; serviceId: string }>;
};

async function BookingInner({
  params,
}: {
  params: Promise<{ proId: string; serviceId: string }>;
}) {
  const { proId, serviceId } = await params;
  const pro = getProById(proId);
  const service = getServiceById(serviceId);

  if (!pro || !service) notFound();

  const offering = getProServicePrice(pro, service.id);
  if (!offering) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <h1 className="text-xl font-bold text-black">Not offered</h1>
        <p className="mt-2 text-sm text-brand-muted">
          {pro.display_name} doesn&apos;t offer {service.name}.
        </p>
        <Link href={`/services/${service.id}`} className="mt-4 text-sm text-brand-muted">
          Back
        </Link>
      </main>
    );
  }

  return (
    <BookingDetailsClient
      pro={pro}
      service={service}
      price={offering.price}
      durationMins={offering.duration_mins}
    />
  );
}

export default function BookingPage({ params }: BookingPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md space-y-4 px-6 pt-20">
          <div className="skeleton h-8 w-32 rounded" />
          <div className="skeleton h-40 w-full rounded" />
        </main>
      }
    >
      <BookingInner params={params} />
    </Suspense>
  );
}
