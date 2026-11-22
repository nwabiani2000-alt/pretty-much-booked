import { z } from "zod";

const uuid = z.string().uuid();
const softId = z.string().min(1).max(80);

/** Accept UUID or mock slug ids used in demo data. */
export const resourceId = z.union([uuid, softId]);

const ukPostcode = z
  .string()
  .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, "Invalid UK postcode");

export const bookingAddressSchema = z.object({
  street: z.string().min(5).max(200).optional(),
  city: z.string().min(2).max(100).optional(),
  postcode: ukPostcode.optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  text: z.string().min(5).max(300).optional(),
});

export const createBookingSchema = z.object({
  pro_id: resourceId,
  service_id: resourceId,
  scheduled_at: z.string().datetime({ offset: true }).or(z.string().min(10)),
  address_text: z.string().min(5).max(300),
  address: bookingAddressSchema.optional(),
  /** Ignored for pricing — server calculates. Kept optional for backward compat. */
  total_price: z.number().positive().max(5000).optional(),
  deposit_amount: z.number().positive().max(5000).optional(),
  customer_id: resourceId.optional(),
  is_emergency: z.boolean().optional(),
  notes: z.string().max(500).optional().nullable(),
  deposit_paid: z.boolean().optional(),
  access_token: z.string().min(8).max(200).optional(),
});

export const paymentDepositSchema = z.object({
  bookingId: resourceId,
  /** Client amount is ignored when booking found — server uses deposit_amount. */
  amountGbp: z.number().positive().max(5000).optional(),
  amount: z.number().positive().max(5000).optional(),
  tipGbp: z.number().min(0).max(500).optional(),
  currency: z.string().max(8).optional(),
  market: z.string().max(20).optional(),
  customerEmail: z.string().email().optional(),
  access_token: z.string().min(8).max(200).optional(),
});

export const otpSendSchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, "Valid E.164 phone required"),
});

export const otpVerifySchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, "Valid E.164 phone required"),
  token: z.string().min(4).max(12),
});

export const reviewSchema = z.object({
  booking_id: resourceId,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  access_token: z.string().min(8).max(200).optional(),
});

export const fileUploadMetaSchema = z.object({
  mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  sizeBytes: z.number().int().positive().max(5 * 1024 * 1024),
});
