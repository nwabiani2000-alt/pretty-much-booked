import { ProProfileClient } from "@/app/pros/[id]/ProProfileClient";
import { getProById } from "@/lib/mock-pros";
import { notFound } from "next/navigation";

type ProPageProps = {
  params: { id: string };
  searchParams?: { service?: string };
};

export default function ProPage({ params, searchParams }: ProPageProps) {
  const pro = getProById(params.id);
  if (!pro) notFound();
  return (
    <ProProfileClient pro={pro} preferredServiceId={searchParams?.service} />
  );
}
