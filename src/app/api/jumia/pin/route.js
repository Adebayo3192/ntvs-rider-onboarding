import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { createJumiaSessionToken, JUMIA_COOKIE_NAME, JUMIA_COOKIE_MAX_AGE } from '@/lib/jumiaSession';

const MAX_ATTEMPTS = 5;

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { token, pin, action } = body;

  if (typeof token !== 'string' || !token || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: rider, error: fetchError } = await supabaseAdmin
    .from('riders')
    .select('id, jumia_pin, jumia_enabled, jumia_locked')
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
      return NextResponse.json({ error: 'A PIN has already been set for this account.', code: 'pin_exists' }, { status: 400 });
    }
    // Only write if the PIN is still empty, so two create requests racing
    // each other can't both win — the second one updates zero rows.
    const { data: created, error } = await supabaseAdmin
      .from('riders')
      .update({ jumia_pin: pin, jumia_pin_attempts: 0 })
      .eq('id', rider.id)
      .is('jumia_pin', null)
      .select('id')
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!created) {
      return NextResponse.json({ error: 'A PIN has already been set for this account.', code: 'pin_exists' }, { status: 400 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(JUMIA_COOKIE_NAME, createJumiaSessionToken(rider.id), {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: JUMIA_COOKIE_MAX_AGE, path: '/',
    });
    return res;
  }

  if (action === 'verify') {
    // No PIN yet means there is nothing to guess — don't count it as a
    // failed attempt.
    if (!rider.jumia_pin) {
      return NextResponse.json({ error: 'No PIN has been set for this account yet.', code: 'no_pin' }, { status: 400 });
    }

    // jumia_verify_pin (a Postgres function) locks the rider's row, compares
    // the PIN and updates the attempt counter / lock in one transaction, so
    // a burst of parallel guesses is checked one at a time and can never get
    // more than MAX_ATTEMPTS tries.
    const { data: result, error } = await supabaseAdmin.rpc('jumia_verify_pin', {
      p_rider_id: rider.id,
      p_pin: pin,
      p_max_attempts: MAX_ATTEMPTS,
    });

    if (error) {
      console.error('jumia_verify_pin failed:', error);
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }

    if (result === 'ok') {
      const res = NextResponse.json({ success: true });
      res.cookies.set(JUMIA_COOKIE_NAME, createJumiaSessionToken(rider.id), {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: JUMIA_COOKIE_MAX_AGE, path: '/',
      });
      return res;
    }

    if (result === 'no_pin') {
      return NextResponse.json({ error: 'No PIN has been set for this account yet.', code: 'no_pin' }, { status: 400 });
    }

    if (result === 'locked' || result === 'locked_now') {
      return NextResponse.json(
        { error: 'Too many incorrect attempts. This PIN is now locked — contact your admin.' },
        { status: 423 }
      );
    }

    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}