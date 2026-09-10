import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
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