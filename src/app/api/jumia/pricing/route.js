import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getCaller, unauthorized, forbidden } from '@/lib/apiAuth';

// Only the admin Pricing page calls this route — the rider report flow
// reads prices server-side in /api/jumia/report/submit. So reading needs a
// logged-in dashboard account, and changing prices needs an admin.
export async function GET(request) {
  const caller = await getCaller(request);
  if (!caller) return unauthorized();

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
  const caller = await getCaller(request);
  if (!caller) return unauthorized();
  if (caller.role !== 'admin') return forbidden();

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