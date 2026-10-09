import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getCaller, unauthorized, forbidden } from '@/lib/apiAuth';

// Creates a blank rider row and its onboarding link. Admin-only: an
// onboarding token is what lets someone upload documents, so the public
// must not be able to mint one.
export async function POST(request) {
  const caller = await getCaller(request);
  if (!caller) return unauthorized();
  if (caller.role !== 'admin') return forbidden();

  const { data, error } = await supabaseAdmin
    .from('riders')
    .insert({})
    .select('id, onboarding_token')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding/${data.onboarding_token}`;

  return NextResponse.json({ riderId: data.id, link });
}