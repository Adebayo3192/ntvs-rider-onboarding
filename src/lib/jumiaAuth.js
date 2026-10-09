import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyJumiaSessionToken, JUMIA_COOKIE_NAME } from '@/lib/jumiaSession';

/**
 * Resolves the rider behind the signed jumia_session cookie, or null if
 * the cookie is missing, tampered with, expired, or belongs to a rider
 * who is no longer jumia_enabled. This is the ONLY place a rider id for
 * the rider-facing Jumia routes should come from — never the URL or body.
 */
export async function getJumiaRider(request) {
  const riderId = verifyJumiaSessionToken(request.cookies.get(JUMIA_COOKIE_NAME)?.value);
  if (!riderId) return null;

  const { data: rider, error } = await supabaseAdmin
    .from('riders')
    .select('id, full_name, jumia_enabled')
    .eq('id', riderId)
    .maybeSingle();

  if (error || !rider || !rider.jumia_enabled) return null;

  return { id: rider.id, name: rider.full_name };
}

/** 401 — no valid rider session; the rider has to open their private link again. */
export function jumiaUnauthorized() {
  return Response.json({ error: 'Your session has expired. Open your private link again.' }, { status: 401 });
}
