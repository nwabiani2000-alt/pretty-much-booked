import { ServicePickClient } from "@/components/booking/ServicePickClient";
import { HOME_CATEGORIES } from "@/lib/services";
import { notFound } from "next/navigation";

type PageProps = {
  params: { category: string };
};

export default function BookCategoryPage({ params }: PageProps) {
  const cat = HOME_CATEGORIES.find((c) => c.id === params.category);
  if (!cat) notFound();
  return <ServicePickClient category={cat.id} label={cat.label} />;
}
