import { ServiceProsClient } from "@/app/services/[id]/ServiceProsClient";
import { getServiceById } from "@/lib/mock-pros";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type ServicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServicePage({ params }: ServicePageProps) {
  const { id } = await params;
  const service = getServiceById(id);
  if (!service) notFound();
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md space-y-4 px-5 pt-20">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-24 w-full rounded-card" />
        </main>
      }
    >
      <ServiceProsClient service={service} />
    </Suspense>
  );
}
