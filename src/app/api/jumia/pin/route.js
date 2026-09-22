import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { riderId, pin, action } = await request.json();

  if (!riderId || !pin || pin.length !== 4) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: rider, error: fetchError } = await supabaseAdmin
    .from('riders')
    .select('jumia_pin')
    .eq('id', riderId)
    .single();

  if (fetchError || !rider) {
    return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
  }

  if (action === 'create') {
    if (rider.jumia_pin) {
      return NextResponse.json({ error: 'PIN already set' }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from('riders')
      .update({ jumia_pin: pin })
      .eq('id', riderId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'verify') {
    if (rider.jumia_pin !== pin) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}