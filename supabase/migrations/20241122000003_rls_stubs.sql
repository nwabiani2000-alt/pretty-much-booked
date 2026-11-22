-- Row Level Security stubs — tighten before production.
-- Assumes public.users.id == auth.uid() when Auth phone OTP is wired.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pro_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Services: public read of active catalog
DROP POLICY IF EXISTS "services_public_read" ON public.services;
CREATE POLICY "services_public_read"
  ON public.services
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- Pros: public read of available, searchable pros (score >= 60)
DROP POLICY IF EXISTS "pros_public_read" ON public.pros;
CREATE POLICY "pros_public_read"
  ON public.pros
  FOR SELECT
  TO anon, authenticated
  USING (is_available = TRUE AND pro_score >= 60);

-- Pro services: public read when available
DROP POLICY IF EXISTS "pro_services_public_read" ON public.pro_services;
CREATE POLICY "pro_services_public_read"
  ON public.pro_services
  FOR SELECT
  TO anon, authenticated
  USING (is_available = TRUE);

-- Users: read/update own profile
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Pros: owner can update their pro row
DROP POLICY IF EXISTS "pros_update_own" ON public.pros;
CREATE POLICY "pros_update_own"
  ON public.pros
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "pros_insert_own" ON public.pros;
CREATE POLICY "pros_insert_own"
  ON public.pros
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Pro services: manage own offerings
DROP POLICY IF EXISTS "pro_services_manage_own" ON public.pro_services;
CREATE POLICY "pro_services_manage_own"
  ON public.pro_services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pros p
      WHERE p.id = pro_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pros p
      WHERE p.id = pro_id AND p.user_id = auth.uid()
    )
  );

-- Bookings: customers see/create own; pros see assigned
DROP POLICY IF EXISTS "bookings_customer_select" ON public.bookings;
CREATE POLICY "bookings_customer_select"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.pros p
      WHERE p.id = pro_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "bookings_customer_insert" ON public.bookings;
CREATE POLICY "bookings_customer_insert"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "bookings_parties_update" ON public.bookings;
CREATE POLICY "bookings_parties_update"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.pros p
      WHERE p.id = pro_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.pros p
      WHERE p.id = pro_id AND p.user_id = auth.uid()
    )
  );

-- NOTE: Service-role / backend jobs bypass RLS. Add admin policies later.
