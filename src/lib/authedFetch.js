import { supabase } from '@/lib/supabaseClient';

/**
 * A drop-in replacement for fetch() that attaches the signed-in user's
 * Supabase access token as "Authorization: Bearer <token>". Use this
 * (instead of the raw fetch()) for any call to our own /api/admin/*
 * routes — those routes now verify who's actually calling and enforce
 * role checks server-side (see src/lib/apiAuth.js), rather than just
 * trusting whatever the UI happens to show for the logged-in role.
 *
 * If there's no active session, this falls back to a plain unauthenticated
 * fetch — the API route itself will then correctly reject it with 401
 * rather than this helper failing silently.
 */
export async function authedFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    ...(options.headers || {}),
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}