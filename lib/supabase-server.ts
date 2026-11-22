import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase helpers.
 * Env (see .env.example):
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY — used for Auth OTP (/api/auth/otp/*)
 * - SUPABASE_SERVICE_ROLE_KEY — admin/server only; never expose via config routes
 */

export function getSupabaseUrl(): string | null {
  return process.env.SUPABASE_URL?.trim() || null;
}

export function getSupabaseAnonKey(): string | null {
  return process.env.SUPABASE_ANON_KEY?.trim() || null;
}

export function getSupabaseServiceRoleKey(): string | null {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    null
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

/** Anon-key client — phone OTP and public RLS paths. */
export function getSupabaseServer(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;
  if (!anonClient) {
    anonClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return anonClient;
}

/** Service-role client — bypasses RLS; never send this key to the browser. */
export function getSupabaseServiceRole(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) return null;
  if (!serviceClient) {
    serviceClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return serviceClient;
}
