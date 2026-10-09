import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getCaller, unauthorized, forbidden } from '@/lib/apiAuth';

// Clears the PIN together with the failed-attempt counter and the lock, so
// this one action both resets a forgotten PIN and unlocks a rider who was
// locked out. The rider's private link stays the same; they create a new
// PIN the next time they open it.
export async function PATCH(request) {
  const caller = await getCaller(request);
  if (!caller) return unauthorized();
  if (caller.role !== 'admin') return forbidden();

  const body = await request.json().catch(() => null);
  const riderId = body?.riderId;
  if (!riderId) {
    return NextResponse.json({ error: 'Missing rider' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('riders')
    .update({ jumia_pin: null, jumia_pin_attempts: 0, jumia_locked: false })
    .eq('id', riderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
