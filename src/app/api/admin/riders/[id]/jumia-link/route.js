import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getCaller, unauthorized, forbidden } from '@/lib/apiAuth';

// POST                  -> returns the rider's private Jumia link token,
//                          generating one if they don't have one yet.
// POST { rotate: true } -> issues a brand-new token (the old link stops
//                          working) and clears the PIN, the failed-attempt
//                          counter and the lock, so the rider starts fresh.
//
// Admin-only: whoever holds this token can set that rider's PIN, so a
// jumia_reviewer account must not be able to mint or rotate one.
export async function POST(request, { params }) {
  const caller = await getCaller(request);
  if (!caller) return unauthorized();
  if (caller.role !== 'admin') return forbidden();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const rotate = body?.rotate === true;

  const { data: rider, error: fetchError } = await supabaseAdmin
    .from('riders')
    .select('id, status, jumia_token, jumia_enabled')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !rider) {
    return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
  }

  if (rider.status !== 'approved') {
    return NextResponse.json({ error: 'Only approved riders can have a Jumia link.' }, { status: 400 });
  }

  let token = rider.jumia_token;

  if (rotate) {
    token = crypto.randomUUID();
    const { error } = await supabaseAdmin
      .from('riders')
      .update({ jumia_token: token, jumia_pin: null, jumia_pin_attempts: 0, jumia_locked: false })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (!token) {
    // Only fill the token in if it's still empty, so two admins clicking at
    // the same moment end up copying the same link instead of each
    // overwriting the other's.
    const { data: updated, error } = await supabaseAdmin
      .from('riders')
      .update({ jumia_token: crypto.randomUUID() })
      .eq('id', id)
      .is('jumia_token', null)
      .select('jumia_token')
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    token = updated?.jumia_token;
    if (!token) {
      const { data: current } = await supabaseAdmin
        .from('riders')
        .select('jumia_token')
        .eq('id', id)
        .maybeSingle();
      token = current?.jumia_token;
    }
    if (!token) return NextResponse.json({ error: 'Could not create a Jumia link.' }, { status: 500 });
  }

  return NextResponse.json({ token, jumiaEnabled: !!rider.jumia_enabled });
}
