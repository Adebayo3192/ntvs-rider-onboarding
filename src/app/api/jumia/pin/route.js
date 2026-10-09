import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { createJumiaSessionToken, JUMIA_COOKIE_NAME, JUMIA_COOKIE_MAX_AGE } from '@/lib/jumiaSession';

const MAX_ATTEMPTS = 5;

export async function POST(request) {
  const { token, pin, action } = await request.json();

  if (!token || !pin || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: rider, error: fetchError } = await supabaseAdmin
    .from('riders')
    .select('id, jumia_pin, jumia_enabled, jumia_locked, jumia_pin_attempts')
    .eq('jumia_token', token)
    .single();

  // Same generic error for "bad token" and "not enabled" — never reveal which,
  // so a leaked/guessed token can't be used to probe rider state.
  if (fetchError || !rider || !rider.jumia_enabled) {
    return NextResponse.json({ error: 'This link is no longer valid.' }, { status: 404 });
  }

  if (rider.jumia_locked) {
    return NextResponse.json(
      { error: 'This PIN has been locked after too many attempts. Contact your admin to reset it.' },
      { status: 423 }
    );
  }

  if (action === 'create') {
    if (rider.jumia_pin) {
      return NextResponse.json({ error: 'A PIN has already been set for this account.' }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from('riders')
      .update({ jumia_pin: pin, jumia_pin_attempts: 0 })
      .eq('id', rider.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const res = NextResponse.json({ success: true });
    res.cookies.set(JUMIA_COOKIE_NAME, createJumiaSessionToken(rider.id), {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: JUMIA_COOKIE_MAX_AGE, path: '/',
    });
    return res;
  }

  if (action === 'verify') {
    if (rider.jumia_pin !== pin) {
      const attempts = (rider.jumia_pin_attempts || 0) + 1;
      const lockedNow = attempts >= MAX_ATTEMPTS;
      await supabaseAdmin
        .from('riders')
        .update({ jumia_pin_attempts: attempts, jumia_locked: lockedNow })
        .eq('id', rider.id);

      return NextResponse.json(
        { error: lockedNow ? 'Too many incorrect attempts. This PIN is now locked — contact your admin.' : 'Incorrect PIN' },
        { status: lockedNow ? 423 : 401 }
      );
    }

    await supabaseAdmin.from('riders').update({ jumia_pin_attempts: 0 }).eq('id', rider.id);

    const res = NextResponse.json({ success: true });
    res.cookies.set(JUMIA_COOKIE_NAME, createJumiaSessionToken(rider.id), {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: JUMIA_COOKIE_MAX_AGE, path: '/',
    });
    return res;
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}