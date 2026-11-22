import { ServicePickClient } from "@/components/booking/ServicePickClient";
import { HOME_CATEGORIES } from "@/lib/services";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ category: string }>;
};

export default async function BookCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = HOME_CATEGORIES.find((c) => c.id === category);
  if (!cat) notFound();
  return <ServicePickClient category={cat.id} label={cat.label} />;
}
