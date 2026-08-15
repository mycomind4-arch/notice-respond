/* ═══════════════════════════════════════════════════════════
   SUPABASE CLIENT
   
   Lazily-initialized Supabase client. Reads URL and anon key
   from environment variables. Returns null if not configured.
   
   On Cloudflare Workers, env vars come from the `env` object.
   In dev/SSR, they come from process.env.
   
   This module bridges both by checking both sources.
   ═══════════════════════════════════════════════════════════ */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Initialize the Supabase client from environment variables.
 * Call this early in the app lifecycle (e.g. server entry).
 */
export function initSupabase(
  url: string,
  anonKey: string,
): SupabaseClient {
  client = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  return client;
}

/**
 * Get the active Supabase client, or null if not initialized.
 */
export function getSupabase(): SupabaseClient | null {
  // Try already-initialized client
  if (client) return client;

  // Try environment variables (dev/SSR)
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key) {
    return initSupabase(url, key);
  }

  return null;
}

/**
 * Check if Supabase is available (either initialized or env vars present).
 */
export function hasSupabase(): boolean {
  return getSupabase() !== null;
}
