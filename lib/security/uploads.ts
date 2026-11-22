import { fileUploadMetaSchema } from "@/lib/security/schemas";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PORTFOLIO = 10;

export type UploadCheck =
  | { ok: true; mime: string; sizeBytes: number }
  | { ok: false; error: string };

/** Validate upload by MIME + size (never by extension alone). */
export function validateImageUpload(meta: {
  mime: string;
  sizeBytes: number;
  existingCount?: number;
}): UploadCheck {
  const parsed = fileUploadMetaSchema.safeParse({
    mime: meta.mime,
    sizeBytes: meta.sizeBytes,
  });
  if (!parsed.success) {
    return { ok: false, error: "Only JPG/PNG/WEBP under 5MB allowed" };
  }
  if (!ALLOWED.has(meta.mime)) {
    return { ok: false, error: "Invalid file type" };
  }
  if (meta.sizeBytes > MAX_BYTES) {
    return { ok: false, error: "File too large (max 5MB)" };
  }
  if ((meta.existingCount ?? 0) >= MAX_PORTFOLIO) {
    return { ok: false, error: "Max 10 portfolio images" };
  }
  return { ok: true, mime: meta.mime, sizeBytes: meta.sizeBytes };
}

export { MAX_BYTES, MAX_PORTFOLIO };
