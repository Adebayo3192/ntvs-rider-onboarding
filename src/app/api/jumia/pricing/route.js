import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('jumia_pricing')
    .select('small_price, medium_price')
    .eq('id', 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request) {
  const { smallPrice, mediumPrice } = await request.json();

  const { error } = await supabaseAdmin
    .from('jumia_pricing')
    .update({
      small_price: smallPrice,
      medium_price: mediumPrice,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}