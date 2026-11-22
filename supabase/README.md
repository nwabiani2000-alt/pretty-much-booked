# Supabase schema — Pretty Much Booked

Migrations repair truncated DDL from `pretty-much-booked-build-spec.pdf` (pages 2–4).

## Files

| Migration | Purpose |
|-----------|---------|
| `migrations/20241122000001_init_schema.sql` | `users`, `pros`, `services`, `pro_services`, `bookings` + indexes/triggers |
| `migrations/20241122000002_seed_services.sql` | 12 catalog services from the build spec |
| `migrations/20241122000003_rls_stubs.sql` | RLS stubs (public read catalog/pros; own-row write) |
| `migrations/20241122000004_security_hardening.sql` | Reviews + RLS, DELETE deny, slot unique, price/emergency guards |

Full apply steps (including hardening): store doc `docs/supabase-security-hardening.md`.

Combined dump for migrations 1–3 also lives at:

`/cursor/stores/bc-111d3e1e-ab1b-4a73-8947-7b579a5aeb68/docs/supabase-schema.sql`

## Run in Supabase SQL Editor

> **If both null → apply 1→3 first.**  
> `SELECT to_regclass('public.bookings'), to_regclass('public.services');`  
> When both return null, **do not** run migration 4 yet — paste/run **1 → 2 → 3** in order, re-check, then hardening.

1. Open your project → **SQL** → **New query**.
2. Paste and run `20241122000001_init_schema.sql` first.
3. Run `20241122000002_seed_services.sql`.
4. Run `20241122000003_rls_stubs.sql`.
5. Or paste the combined `docs/supabase-schema.sql` once (covers 1–3 only).
6. After quick check is non-null, run `20241122000004_security_hardening.sql`.

Confirm:

```sql
SELECT to_regclass('public.bookings') AS bookings,
       to_regclass('public.services') AS services;
SELECT name, category, base_price FROM public.services ORDER BY category, name;
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

## CLI (optional)

```bash
# From repo root, with Supabase CLI linked to the project
supabase db push
# or
supabase migration up
```

## Auth note

Phone OTP uses `auth.users`. Create a matching `public.users` row with `id = auth.uid()` after verify (trigger or app insert). RLS policies assume that mapping.

## PDF repairs

- `services.category` comment completed: hair | nails | makeup | lashes | massage | barber (+ CHECK)
- `bookings.status` completed: pending | accepted | confirmed | in_progress | completed | cancelled (+ CHECK)
- Seed `INSERT` column list + truncated emoji lines restored
- `TIMESTAMP` → `TIMESTAMPTZ`; `updated_at` trigger on bookings
