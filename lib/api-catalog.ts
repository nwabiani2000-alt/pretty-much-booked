import { MOCK_PROS, type MockProListing } from "@/lib/mock-pros";
import { MOCK_SERVICES } from "@/lib/services";
import {
  getSupabaseServiceRole,
  getSupabaseServer,
  isSupabaseConfigured,
} from "@/lib/supabase-server";
import type { Booking, Service, ServiceCategory } from "@/types/booking";

export type ApiMode = "live" | "mock";

export type ApiService = Service & { source?: ApiMode };

export type ApiPro = {
  id: string;
  display_name: string;
  bio?: string | null;
  specialties: string[];
  rating: number;
  pro_score: number;
  reviews?: number;
  completed_bookings?: number;
  response_time_mins?: number;
  is_verified?: boolean;
  is_available?: boolean;
  is_available_now?: boolean;
  distance_miles?: number;
  next_available?: string;
  initials?: string;
  offerings?: Record<string, { price: number; duration_mins: number }>;
  service_radius_km?: number;
};

export type ApiBooking = {
  id: string;
  customer_id: string;
  pro_id: string;
  service_id: string;
  status: string;
  is_emergency: boolean;
  scheduled_at: string;
  address: { lat: number; lng: number };
  address_text: string;
  total_price: number;
  deposit_amount: number;
  deposit_paid: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  mode?: ApiMode;
  /** Opaque token — returned once at create; required for mock IDOR protection. */
  access_token?: string;
};

/** In-memory bookings when Supabase empty / unavailable. */
const mockBookings = new Map<string, ApiBooking>();

/** Strip secrets before returning lists to clients. */
export function publicBooking(b: ApiBooking): Omit<ApiBooking, "access_token"> {
  const rest = { ...b };
  delete rest.access_token;
  return rest;
}

function seedMockBookings(): void {
  if (mockBookings.size > 0) return;
  // Lazy import avoided in seed — token minted on first get via ensure below.
  const now = new Date();
  const id = "bk_mock_1";
  const customer_id = "cust_mock";
  const b: ApiBooking = {
    id,
    customer_id,
    pro_id: "1",
    service_id: "box-braids",
    status: "pending",
    is_emergency: false,
    scheduled_at: new Date(now.setHours(14, 0, 0, 0)).toISOString(),
    address: { lat: 51.5246, lng: -0.0805 },
    address_text: "42 Curtain Road, London",
    total_price: 85,
    deposit_amount: 25.5,
    deposit_paid: false,
    notes: null,
    created_at: new Date().toISOString(),
    mode: "mock",
    access_token: `seed.${id}.${customer_id}`,
  };
  mockBookings.set(b.id, b);
}

function mapMockPro(p: MockProListing): ApiPro {
  return {
    id: p.id,
    display_name: p.display_name,
    bio: p.bio,
    specialties: p.specialties,
    rating: p.rating,
    pro_score: p.pro_score,
    reviews: p.reviews,
    completed_bookings: p.completed_bookings,
    response_time_mins: p.response_time_mins,
    is_verified: p.is_verified,
    is_available: p.is_available,
    is_available_now: p.is_available_now,
    distance_miles: p.distance_miles,
    next_available: p.next_available,
    initials: p.initials,
    offerings: p.offerings,
  };
}

export async function listServices(opts?: {
  category?: string;
}): Promise<{ data: ApiService[]; mode: ApiMode }> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServer() ?? getSupabaseServiceRole();
    if (sb) {
      let q = sb.from("services").select("*").eq("is_active", true);
      if (opts?.category) q = q.eq("category", opts.category);
      const { data, error } = await q.order("name");
      if (!error && data && data.length > 0) {
        return {
          mode: "live",
          data: data.map((row) => ({
            id: String(row.id),
            name: row.name,
            category: row.category as ServiceCategory,
            description: row.description ?? "",
            icon: row.icon ?? "",
            base_price: Number(row.base_price ?? 0),
            duration_mins: Number(row.duration_mins ?? 0),
            image_url: row.image_url,
            is_active: row.is_active ?? true,
            source: "live" as const,
          })),
        };
      }
    }
  }

  let list = MOCK_SERVICES.map((s) => ({ ...s, source: "mock" as const }));
  if (opts?.category) {
    list = list.filter((s) => s.category === opts.category);
  }
  return { mode: "mock", data: list };
}

export async function getService(
  id: string
): Promise<{ data: ApiService | null; mode: ApiMode }> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServer() ?? getSupabaseServiceRole();
    if (sb) {
      // Try UUID id, then name slug match via all rows if needed
      const { data, error } = await sb
        .from("services")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        return {
          mode: "live",
          data: {
            id: String(data.id),
            name: data.name,
            category: data.category as ServiceCategory,
            description: data.description ?? "",
            icon: data.icon ?? "",
            base_price: Number(data.base_price ?? 0),
            duration_mins: Number(data.duration_mins ?? 0),
            image_url: data.image_url,
            is_active: data.is_active ?? true,
            source: "live",
          },
        };
      }
    }
  }

  const mock = MOCK_SERVICES.find((s) => s.id === id) ?? null;
  return {
    mode: "mock",
    data: mock ? { ...mock, source: "mock" } : null,
  };
}

export async function listPros(opts?: {
  serviceId?: string;
}): Promise<{ data: ApiPro[]; mode: ApiMode }> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServer() ?? getSupabaseServiceRole();
    if (sb) {
      const { data, error } = await sb
        .from("pros")
        .select("*")
        .eq("is_available", true)
        .gte("pro_score", 60)
        .order("pro_score", { ascending: false });
      if (!error && data && data.length > 0) {
        let rows = data;
        if (opts?.serviceId) {
          const { data: offerings } = await sb
            .from("pro_services")
            .select("pro_id")
            .eq("service_id", opts.serviceId)
            .eq("is_available", true);
          const ids = new Set((offerings ?? []).map((o) => String(o.pro_id)));
          rows = rows.filter((p) => ids.has(String(p.id)));
        }
        return {
          mode: "live",
          data: rows.map((p) => ({
            id: String(p.id),
            display_name: p.display_name,
            bio: p.bio,
            specialties: p.specialties ?? [],
            rating: Number(p.rating ?? 5),
            pro_score: Number(p.pro_score ?? 0),
            completed_bookings: p.completed_bookings,
            response_time_mins: p.response_time_mins,
            is_verified: p.is_verified,
            is_available: p.is_available,
            service_radius_km: p.service_radius_km,
          })),
        };
      }
    }
  }

  let list = MOCK_PROS.map(mapMockPro);
  if (opts?.serviceId) {
    list = list.filter((p) => p.offerings?.[opts.serviceId!]);
  }
  return { mode: "mock", data: list };
}

export async function getPro(
  id: string
): Promise<{ data: ApiPro | null; mode: ApiMode }> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServer() ?? getSupabaseServiceRole();
    if (sb) {
      const { data, error } = await sb
        .from("pros")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        const { data: offerings } = await sb
          .from("pro_services")
          .select("service_id, price, duration_mins")
          .eq("pro_id", id);
        const map: Record<string, { price: number; duration_mins: number }> =
          {};
        for (const o of offerings ?? []) {
          map[String(o.service_id)] = {
            price: Number(o.price),
            duration_mins: Number(o.duration_mins),
          };
        }
        return {
          mode: "live",
          data: {
            id: String(data.id),
            display_name: data.display_name,
            bio: data.bio,
            specialties: data.specialties ?? [],
            rating: Number(data.rating ?? 5),
            pro_score: Number(data.pro_score ?? 0),
            completed_bookings: data.completed_bookings,
            response_time_mins: data.response_time_mins,
            is_verified: data.is_verified,
            is_available: data.is_available,
            service_radius_km: data.service_radius_km,
            offerings: map,
          },
        };
      }
    }
  }

  const mock = MOCK_PROS.find((p) => p.id === id);
  return { mode: "mock", data: mock ? mapMockPro(mock) : null };
}

export async function listBookings(opts?: {
  customerId?: string;
  proId?: string;
}): Promise<{ data: ApiBooking[]; mode: ApiMode }> {
  // Prefer anon/user-scoped client so RLS applies. Service role only when
  // caller already authorized server-side with an explicit filter.
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServer() ?? getSupabaseServiceRole();
    if (sb) {
      let q = sb.from("bookings").select("*").order("scheduled_at", {
        ascending: false,
      });
      if (opts?.customerId) q = q.eq("customer_id", opts.customerId);
      if (opts?.proId) q = q.eq("pro_id", opts.proId);
      // Refuse unscoped live queries — prevents full-table IDOR via service role.
      if (!opts?.customerId && !opts?.proId) {
        return { mode: "live", data: [] };
      }
      const { data, error } = await q;
      if (!error && data) {
        return {
          mode: "live",
          data: data.map((row) => ({
            id: String(row.id),
            customer_id: String(row.customer_id),
            pro_id: String(row.pro_id),
            service_id: String(row.service_id),
            status: row.status,
            is_emergency: Boolean(row.is_emergency),
            scheduled_at: row.scheduled_at,
            address: (row.address as { lat: number; lng: number }) ?? {
              lat: 0,
              lng: 0,
            },
            address_text: row.address_text,
            total_price: Number(row.total_price),
            deposit_amount: Number(row.deposit_amount),
            deposit_paid: Boolean(row.deposit_paid),
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
            mode: "live" as const,
          })),
        };
      }
    }
  }

  seedMockBookings();
  let list = Array.from(mockBookings.values());
  if (opts?.customerId) {
    list = list.filter((b) => b.customer_id === opts.customerId);
  }
  if (opts?.proId) {
    list = list.filter((b) => b.pro_id === opts.proId);
  }
  // Unscoped mock list also refused.
  if (!opts?.customerId && !opts?.proId) {
    return { mode: "mock", data: [] };
  }
  return { mode: "mock", data: list };
}

export async function getBookingById(
  id: string
): Promise<{ data: ApiBooking | null; mode: ApiMode }> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServer() ?? getSupabaseServiceRole();
    if (sb) {
      const { data, error } = await sb
        .from("bookings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        return {
          mode: "live",
          data: {
            id: String(data.id),
            customer_id: String(data.customer_id),
            pro_id: String(data.pro_id),
            service_id: String(data.service_id),
            status: data.status,
            is_emergency: Boolean(data.is_emergency),
            scheduled_at: data.scheduled_at,
            address: (data.address as { lat: number; lng: number }) ?? {
              lat: 0,
              lng: 0,
            },
            address_text: data.address_text,
            total_price: Number(data.total_price),
            deposit_amount: Number(data.deposit_amount),
            deposit_paid: Boolean(data.deposit_paid),
            notes: data.notes,
            created_at: data.created_at,
            updated_at: data.updated_at,
            mode: "live",
          },
        };
      }
    }
  }

  seedMockBookings();
  const b = mockBookings.get(id) ?? null;
  return { mode: "mock", data: b };
}

export type CreateBookingInput = {
  customer_id?: string;
  pro_id: string;
  service_id: string;
  scheduled_at: string;
  address_text: string;
  address?: { lat: number; lng: number };
  total_price: number;
  deposit_amount: number;
  is_emergency?: boolean;
  notes?: string | null;
  deposit_paid?: boolean;
};

export async function createBooking(
  input: CreateBookingInput
): Promise<{ data: ApiBooking | null; mode: ApiMode; error?: string }> {
  const { mintBookingAccessToken } = await import(
    "@/lib/security/auth-context"
  );
  const { calculateBookingPrice } = await import("@/lib/security/pricing");

  const priced = await calculateBookingPrice({
    proId: input.pro_id,
    serviceId: input.service_id,
    isEmergency: input.is_emergency,
  });
  if (!priced) {
    return {
      data: null,
      mode: "mock",
      error: "Invalid pro_id or service_id — cannot price booking",
    };
  }
  // Server-side amounts win; ignore client totals.
  const total_price = priced.total_price;
  const deposit_amount = priced.deposit_amount;

  if (isSupabaseConfigured()) {
    const sb = getSupabaseServiceRole();
    if (sb) {
      const row = {
        customer_id: input.customer_id,
        pro_id: input.pro_id,
        service_id: input.service_id,
        status: "pending",
        is_emergency: Boolean(input.is_emergency),
        scheduled_at: input.scheduled_at,
        address: input.address ?? { lat: 51.52, lng: -0.08 },
        address_text: input.address_text,
        total_price,
        deposit_amount,
        deposit_paid: Boolean(input.deposit_paid),
        notes: input.notes ?? null,
      };
      // Only attempt live insert when customer_id looks like a UUID
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (
        input.customer_id &&
        uuidRe.test(input.customer_id) &&
        uuidRe.test(input.pro_id) &&
        uuidRe.test(input.service_id)
      ) {
        const { data, error } = await sb
          .from("bookings")
          .insert(row)
          .select("*")
          .single();
        if (!error && data) {
          const id = String(data.id);
          const customer_id = String(data.customer_id);
          return {
            mode: "live",
            data: {
              id,
              customer_id,
              pro_id: String(data.pro_id),
              service_id: String(data.service_id),
              status: data.status,
              is_emergency: Boolean(data.is_emergency),
              scheduled_at: data.scheduled_at,
              address: data.address as { lat: number; lng: number },
              address_text: data.address_text,
              total_price: Number(data.total_price),
              deposit_amount: Number(data.deposit_amount),
              deposit_paid: Boolean(data.deposit_paid),
              notes: data.notes,
              created_at: data.created_at,
              updated_at: data.updated_at,
              mode: "live",
              access_token: mintBookingAccessToken(id, customer_id),
            },
          };
        }
        if (error) {
          return { data: null, mode: "live", error: "Could not create booking" };
        }
      }
    }
  }

  seedMockBookings();
  const customer_id = input.customer_id || "cust_mock";
  const id = `bk_${Date.now().toString(36)}`;
  const booking: ApiBooking = {
    id,
    customer_id,
    pro_id: input.pro_id,
    service_id: input.service_id,
    status: "pending",
    is_emergency: Boolean(input.is_emergency),
    scheduled_at: input.scheduled_at,
    address: input.address ?? { lat: 51.52, lng: -0.08 },
    address_text: input.address_text,
    total_price,
    deposit_amount,
    deposit_paid: Boolean(input.deposit_paid),
    notes: input.notes ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    mode: "mock",
    access_token: mintBookingAccessToken(id, customer_id),
  };
  mockBookings.set(booking.id, booking);
  return { mode: "mock", data: booking };
}

export type { Booking };
