import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function PATCH(request) {
  const { riderId } = await request.json();

  const { error } = await supabaseAdmin
    .from('riders')
    .update({ jumia_pin: null })
    .eq('id', riderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}