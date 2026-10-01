import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

/**
 * Verifies the Supabase access token sent as "Authorization: Bearer <token>"
 * by the frontend's authedFetch() helper, and returns the caller's user +
 * role — or null if there's no token at all, or the token doesn't belong
 * to a real, currently-valid session (expired, signed out, tampered with).
 *
 * role comes from user_metadata.role (the same field the dashboard itself
 * reads to decide what to show), defaulting to 'admin' when it isn't set.
 * That default matters: every account created before the jumia_reviewer
 * role existed has no role field at all, and without this default they'd
 * suddenly get locked out of their own admin routes.
 */
export async function getCaller(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;

  return { user: data.user, role: data.user.user_metadata?.role || 'admin' };
}

/** 401 — nobody logged in, or the session token didn't check out. */
export function unauthorized() {
  return NextResponse.json({ error: 'Please log in again to continue.' }, { status: 401 });
}

/** 403 — logged in, but this account's role isn't allowed to do this. */
export function forbidden() {
  return NextResponse.json({ error: 'You do not have permission to do that.' }, { status: 403 });
}