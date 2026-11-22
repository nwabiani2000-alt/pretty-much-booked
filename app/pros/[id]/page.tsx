import { ProProfileClient } from "@/app/pros/[id]/ProProfileClient";
import { getProById } from "@/lib/mock-pros";
import { notFound } from "next/navigation";

type ProPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ service?: string }>;
};

export default async function ProPage({ params, searchParams }: ProPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;
  const pro = getProById(id);
  if (!pro) notFound();
  return (
    <ProProfileClient pro={pro} preferredServiceId={query?.service} />
  );
}
