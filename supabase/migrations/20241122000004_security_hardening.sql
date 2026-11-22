-- PMB security hardening — RLS completeness, reviews, booking constraints.
-- Apply after 20241122000003_rls_stubs.sql

-- ---------------------------------------------------------------------------
-- Reviews table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id),
  pro_id UUID NOT NULL REFERENCES public.pros(id),
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reviews_rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT reviews_one_per_booking UNIQUE (booking_id)
);

CREATE INDEX IF NOT EXISTS reviews_pro_id_idx ON public.reviews(pro_id);
CREATE INDEX IF NOT EXISTS reviews_customer_id_idx ON public.reviews(customer_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
CREATE POLICY "reviews_public_read"
  ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "reviews_customer_insert" ON public.reviews;
CREATE POLICY "reviews_customer_insert"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND b.customer_id = auth.uid()
        AND b.status = 'completed'
    )
  );

-- No update/delete of reviews by customers or pros (immutable once posted)
DROP POLICY IF EXISTS "reviews_no_update" ON public.reviews;
CREATE POLICY "reviews_no_update"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (FALSE);

DROP POLICY IF EXISTS "reviews_no_delete" ON public.reviews;
CREATE POLICY "reviews_no_delete"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- ---------------------------------------------------------------------------
-- Deny anonymous writes; explicit DELETE deny on core tables
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "users_no_delete" ON public.users;
CREATE POLICY "users_no_delete"
  ON public.users FOR DELETE TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "pros_no_delete" ON public.pros;
CREATE POLICY "pros_no_delete"
  ON public.pros FOR DELETE TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "bookings_no_delete" ON public.bookings;
CREATE POLICY "bookings_no_delete"
  ON public.bookings FOR DELETE TO authenticated USING (FALSE);

DROP POLICY IF EXISTS "services_no_write_anon" ON public.services;
CREATE POLICY "services_no_write_anon"
  ON public.services FOR ALL TO anon
  USING (FALSE)
  WITH CHECK (FALSE);

-- ---------------------------------------------------------------------------
-- Double-booking prevention (active statuses only)
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS bookings_pro_slot_unique
  ON public.bookings (pro_id, scheduled_at)
  WHERE status NOT IN ('cancelled');

-- ---------------------------------------------------------------------------
-- Emergency flag immutable after insert
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_emergency_flip()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_emergency IS DISTINCT FROM OLD.is_emergency THEN
    RAISE EXCEPTION 'is_emergency is immutable after booking creation';
  END IF;
  -- Prevent client price tampering via direct UPDATE
  IF NEW.total_price IS DISTINCT FROM OLD.total_price
     OR NEW.deposit_amount IS DISTINCT FROM OLD.deposit_amount THEN
    -- Allow service-role / admin path via current_setting bypass
    IF COALESCE(current_setting('pmb.allow_price_fix', true), 'off') <> 'on' THEN
      RAISE EXCEPTION 'price fields are immutable';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_prevent_emergency_flip ON public.bookings;
CREATE TRIGGER bookings_prevent_emergency_flip
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE PROCEDURE public.prevent_emergency_flip();

-- ---------------------------------------------------------------------------
-- Tighten booking updates: customers may only cancel / edit notes;
-- pros may update status. Enforced via column-level intent in app + trigger.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bookings_update_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_customer BOOLEAN;
  is_pro BOOLEAN;
BEGIN
  is_customer := (OLD.customer_id = auth.uid());
  is_pro := EXISTS (
    SELECT 1 FROM public.pros p
    WHERE p.id = OLD.pro_id AND p.user_id = auth.uid()
  );

  IF NOT (is_customer OR is_pro) THEN
    RAISE EXCEPTION 'not a party to this booking';
  END IF;

  IF is_customer AND NOT is_pro THEN
    -- Customer: may cancel or edit notes only
    IF NEW.pro_id IS DISTINCT FROM OLD.pro_id
       OR NEW.service_id IS DISTINCT FROM OLD.service_id
       OR NEW.customer_id IS DISTINCT FROM OLD.customer_id
       OR NEW.scheduled_at IS DISTINCT FROM OLD.scheduled_at THEN
      RAISE EXCEPTION 'customers cannot reassign booking fields';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_update_guard ON public.bookings;
CREATE TRIGGER bookings_update_guard
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE PROCEDURE public.bookings_update_guard();

-- ---------------------------------------------------------------------------
-- Cancellation abuse tracking helper column
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS cancellation_count_30d INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.users.cancellation_count_30d IS
  'Rolling 30-day cancellation count; block booking after 3.';
