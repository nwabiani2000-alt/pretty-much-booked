"use client";

import { formatDuration, formatFromPrice } from "@/lib/services";
import type { Service } from "@/types/booking";
import Link from "next/link";

type ServiceSelectorProps = {
  services: Service[];
};

export function ServiceSelector({ services }: ServiceSelectorProps) {
  if (services.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-brand-dark/60">
        No services match your search.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {services.map((service) => (
        <Link
          key={service.id}
          href={`/services/${service.id}`}
          className="group flex flex-col rounded-2xl bg-white/90 p-3.5 shadow-sm shadow-brand-purple/5 ring-1 ring-brand-purple/8 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand-purple/15 hover:ring-brand-gold/40"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple-light to-white text-2xl ring-1 ring-brand-purple/10 transition group-hover:from-brand-gold/20">
            <span aria-hidden>{service.icon}</span>
          </div>
          <h3 className="text-sm font-semibold leading-snug text-brand-dark">
            {service.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-brand-purple">
            {formatFromPrice(service.base_price)}
          </p>
          <p className="mt-0.5 text-xs text-brand-dark/55">
            {formatDuration(service.duration_mins)}
          </p>
        </Link>
      ))}
    </div>
  );
}
