-- Pretty Much Booked — core schema
-- Source: build-spec PDF (pages 2–4), truncated DDL repaired.
-- Run via Supabase SQL Editor or `supabase db push` / migration apply.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Users (customers)
-- When using Supabase Auth phone OTP, set id = auth.users.id on profile create.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  email VARCHAR,
  avatar_url TEXT,
  default_address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Customer profiles; id should match auth.users.id when Auth is wired.';
COMMENT ON COLUMN public.users.default_address IS 'JSON: { lat, lng, text }';

-- ---------------------------------------------------------------------------
-- Pros (beauty professionals)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  display_name VARCHAR NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  portfolio_images TEXT[] DEFAULT '{}',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  rating DECIMAL(3,2) NOT NULL DEFAULT 5.0,
  pro_score INT NOT NULL DEFAULT 100,
  total_bookings INT NOT NULL DEFAULT 0,
  completed_bookings INT NOT NULL DEFAULT 0,
  cancellation_rate DECIMAL(4,2) NOT NULL DEFAULT 0,
  response_time_mins INT NOT NULL DEFAULT 5,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  base_location JSONB,
  service_radius_km INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pros_rating_range CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT pros_score_range CHECK (pro_score >= 0 AND pro_score <= 100)
);

COMMENT ON COLUMN public.pros.base_location IS 'JSON: { lat, lng }';
COMMENT ON COLUMN public.pros.pro_score IS '0–100; Elite 90+, Top 75–89, Verified 60–74; hide <60 from search';

CREATE INDEX IF NOT EXISTS pros_user_id_idx ON public.pros(user_id);
CREATE INDEX IF NOT EXISTS pros_available_score_idx
  ON public.pros(is_available, pro_score DESC)
  WHERE is_available = TRUE;

-- ---------------------------------------------------------------------------
-- Services (catalog)
-- PDF truncated category comment mid-line — full set below.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  description TEXT,
  icon VARCHAR,
  base_price DECIMAL(10,2),
  duration_mins INT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT services_category_check CHECK (
    category IN ('hair', 'nails', 'makeup', 'lashes', 'massage', 'barber')
  ),
  CONSTRAINT services_price_nonneg CHECK (base_price IS NULL OR base_price >= 0),
  CONSTRAINT services_duration_pos CHECK (duration_mins IS NULL OR duration_mins > 0)
);

CREATE INDEX IF NOT EXISTS services_category_active_idx
  ON public.services(category)
  WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- Pro Services (what each pro offers + their pricing)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pro_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID NOT NULL REFERENCES public.pros(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  duration_mins INT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (pro_id, service_id),
  CONSTRAINT pro_services_price_pos CHECK (price >= 0),
  CONSTRAINT pro_services_duration_pos CHECK (duration_mins > 0)
);

CREATE INDEX IF NOT EXISTS pro_services_service_id_idx ON public.pro_services(service_id);
CREATE INDEX IF NOT EXISTS pro_services_pro_id_idx ON public.pro_services(pro_id);

-- ---------------------------------------------------------------------------
-- Bookings
-- PDF truncated status enum mid "in_progr…" — completed as in_progress + peers.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.users(id),
  pro_id UUID NOT NULL REFERENCES public.pros(id),
  service_id UUID NOT NULL REFERENCES public.services(id),
  status VARCHAR NOT NULL DEFAULT 'pending',
  is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  address JSONB NOT NULL,
  address_text VARCHAR NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_by VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_status_check CHECK (
    status IN (
      'pending',
      'accepted',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled'
    )
  ),
  CONSTRAINT bookings_price_nonneg CHECK (total_price >= 0 AND deposit_amount >= 0),
  CONSTRAINT bookings_cancelled_by_check CHECK (
    cancelled_by IS NULL OR cancelled_by IN ('customer', 'pro', 'admin', 'system')
  )
);

COMMENT ON COLUMN public.bookings.address IS 'JSON: { lat, lng }';
COMMENT ON COLUMN public.bookings.deposit_amount IS 'Typically 30% of total_price (Stripe deposit).';

CREATE INDEX IF NOT EXISTS bookings_customer_id_idx ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS bookings_pro_id_idx ON public.bookings(pro_id);
CREATE INDEX IF NOT EXISTS bookings_status_scheduled_idx ON public.bookings(status, scheduled_at);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();
