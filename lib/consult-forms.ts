/**
 * Consultation / allergy / patch forms — category-gated.
 */

import type { ServiceCategory } from "@/types/booking";

export type ConsultField = {
  id: string;
  label: string;
  type: "yesno" | "text";
};

export function needsConsultForm(category: ServiceCategory): boolean {
  return category === "lashes" || category === "makeup" || category === "nails";
}

export function consultFields(category: ServiceCategory): ConsultField[] {
  if (category === "lashes") {
    return [
      { id: "patch", label: "Patch test done in last 48h?", type: "yesno" },
      { id: "allergy_eyes", label: "Eye allergies / sensitivities?", type: "yesno" },
      { id: "notes", label: "Anything else?", type: "text" },
    ];
  }
  if (category === "makeup") {
    return [
      { id: "skin_allergy", label: "Skin allergies to makeup?", type: "yesno" },
      { id: "pregnant", label: "Pregnant / nursing?", type: "yesno" },
      { id: "notes", label: "Skin notes", type: "text" },
    ];
  }
  if (category === "nails") {
    return [
      { id: "acrylic_allergy", label: "Allergy to acrylic / gel?", type: "yesno" },
      { id: "infection", label: "Open cuts or infection on hands?", type: "yesno" },
      { id: "notes", label: "Notes", type: "text" },
    ];
  }
  return [];
}
