import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { archived } = await request.json();

  const { error } = await supabaseAdmin
    .from('riders')
    .update({ archived })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}