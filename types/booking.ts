export type ServiceCategory =
  | "hair"
  | "nails"
  | "makeup"
  | "lashes"
  | "massage"
  | "barber";

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string | null;
  avatar_url?: string | null;
  default_address?: {
    lat: number;
    lng: number;
    text: string;
  } | null;
  created_at?: string;
}

export interface Pro {
  id: string;
  user_id?: string;
  display_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  portfolio_images?: string[];
  specialties: string[];
  rating: number;
  pro_score: number;
  total_bookings?: number;
  completed_bookings?: number;
  cancellation_rate?: number;
  response_time_mins?: number;
  is_verified?: boolean;
  is_available?: boolean;
  base_location?: {
    lat: number;
    lng: number;
  } | null;
  service_radius_km?: number;
  created_at?: string;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  icon: string;
  base_price: number;
  duration_mins: number;
  image_url?: string | null;
  is_active?: boolean;
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  customer_id: string;
  pro_id: string;
  service_id: string;
  status: BookingStatus;
  is_emergency: boolean;
  scheduled_at: string;
  address: {
    lat: number;
    lng: number;
  };
  address_text: string;
  total_price: number;
  deposit_amount: number;
  deposit_paid: boolean;
  notes?: string | null;
  cancellation_reason?: string | null;
  cancelled_by?: string | null;
  created_at?: string;
  updated_at?: string;
}
