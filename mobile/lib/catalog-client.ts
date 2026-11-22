import { apiFetch } from './api';
import { readStoredMarket } from './market';
import {
  getProsForService,
  getProById,
  type MockProListing,
} from './mock-pros';
import { getServiceById } from './services';

function marketQuery(): string {
  return `market=${encodeURIComponent(readStoredMarket())}`;
}

export type ApiPro = {
  id: string;
  display_name: string;
  bio?: string | null;
  specialties?: string[];
  rating: number;
  pro_score: number;
  reviews?: number;
  is_verified?: boolean;
  is_available_now?: boolean;
  distance_miles?: number;
  next_available?: string;
  initials?: string;
  offerings?: Record<string, { price: number; duration_mins: number }>;
};

export type ApiBooking = {
  id: string;
  customer_id: string;
  pro_id: string;
  service_id: string;
  status: string;
  is_emergency: boolean;
  scheduled_at: string;
  address_text: string;
  total_price: number;
  deposit_amount: number;
  deposit_paid: boolean;
  notes?: string | null;
  mode?: string;
};

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Normalize API pro into the shape ProCard expects. */
export function toListing(
  pro: ApiPro,
  serviceId?: string
): MockProListing {
  const local = getProById(pro.id);
  const service = serviceId ? getServiceById(serviceId) : undefined;
  const offerings =
    pro.offerings && Object.keys(pro.offerings).length > 0
      ? pro.offerings
      : local?.offerings ??
        (serviceId && service
          ? {
              [serviceId]: {
                price: service.base_price,
                duration_mins: service.duration_mins,
              },
            }
          : {});

  return {
    id: pro.id,
    display_name: pro.display_name,
    initials: pro.initials || local?.initials || initialsFromName(pro.display_name),
    bio: pro.bio || local?.bio || '',
    rating: pro.rating,
    pro_score: pro.pro_score,
    reviews: pro.reviews ?? local?.reviews ?? 0,
    is_verified: pro.is_verified ?? true,
    is_available_now: pro.is_available_now ?? local?.is_available_now ?? true,
    distance_miles: pro.distance_miles ?? local?.distance_miles ?? 2,
    next_available: pro.next_available ?? local?.next_available ?? 'Soon',
    offerings,
  };
}

export async function fetchProsForService(
  serviceId: string
): Promise<{ pros: MockProListing[]; mode: 'live' | 'mock'; source: 'api' | 'fallback' }> {
  try {
    const res = await apiFetch(
      `/api/pros?serviceId=${encodeURIComponent(serviceId)}&${marketQuery()}`
    );
    if (!res.ok) throw new Error(`pros ${res.status}`);
    const data = (await res.json()) as {
      mode?: 'live' | 'mock';
      pros?: ApiPro[];
    };
    const list = (data.pros ?? []).map((p) => toListing(p, serviceId));
    if (list.length === 0) {
      return {
        pros: getProsForService(serviceId),
        mode: 'mock',
        source: 'fallback',
      };
    }
    return {
      pros: list,
      mode: data.mode ?? 'mock',
      source: 'api',
    };
  } catch {
    return {
      pros: getProsForService(serviceId),
      mode: 'mock',
      source: 'fallback',
    };
  }
}

export async function fetchPro(
  id: string
): Promise<{ pro: MockProListing | null; source: 'api' | 'fallback' }> {
  try {
    const res = await apiFetch(
      `/api/pros/${encodeURIComponent(id)}?${marketQuery()}`
    );
    if (!res.ok) throw new Error(`pro ${res.status}`);
    const data = (await res.json()) as { pro?: ApiPro };
    if (!data.pro) throw new Error('missing');
    return { pro: toListing(data.pro), source: 'api' };
  } catch {
    const local = getProById(id);
    return { pro: local ?? null, source: 'fallback' };
  }
}

export type CreateBookingBody = {
  pro_id: string;
  service_id: string;
  scheduled_at: string;
  address_text: string;
  total_price: number;
  deposit_amount: number;
  customer_id?: string;
  is_emergency?: boolean;
  notes?: string | null;
  deposit_paid?: boolean;
};

export async function createBookingRemote(
  body: CreateBookingBody
): Promise<{
  booking: ApiBooking | null;
  mode: 'live' | 'mock';
  source: 'api' | 'fallback';
  error?: string;
}> {
  try {
    const res = await apiFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as {
      mode?: 'live' | 'mock';
      booking?: ApiBooking;
      error?: string;
    };
    if (!res.ok || !data.booking) {
      throw new Error(data.error || `bookings ${res.status}`);
    }
    return {
      booking: data.booking,
      mode: data.mode ?? 'mock',
      source: 'api',
    };
  } catch (e) {
    return {
      booking: null,
      mode: 'mock',
      source: 'fallback',
      error: e instanceof Error ? e.message : 'network',
    };
  }
}

export async function fetchBookingsList(): Promise<{
  bookings: ApiBooking[];
  mode: 'live' | 'mock';
  source: 'api' | 'fallback';
}> {
  try {
    const res = await apiFetch(`/api/bookings?${marketQuery()}`);
    if (!res.ok) throw new Error(`bookings ${res.status}`);
    const data = (await res.json()) as {
      mode?: 'live' | 'mock';
      bookings?: ApiBooking[];
    };
    return {
      bookings: data.bookings ?? [],
      mode: data.mode ?? 'mock',
      source: 'api',
    };
  } catch {
    return { bookings: [], mode: 'mock', source: 'fallback' };
  }
}
