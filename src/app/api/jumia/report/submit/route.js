import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { riderId, reportDate, screenshotUrl, small, medium } = await request.json();

  if (!riderId || !reportDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: pricing } = await supabaseAdmin
    .from('jumia_pricing')
    .select('small_price, medium_price')
    .eq('id', 1)
    .single();

  const smallPrice = pricing?.small_price || 0;
  const mediumPrice = pricing?.medium_price || 0;
  const totalAmount = small * smallPrice + medium * mediumPrice;

  const { data: existing } = await supabaseAdmin
    .from('jumia_reports')
    .select('id, settled')
    .eq('rider_id', riderId)
    .eq('report_date', reportDate)
    .maybeSingle();

  if (existing?.settled) {
    return NextResponse.json({ error: 'This day has already been settled and can no longer be edited.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('jumia_reports')
    .upsert(
      {
        rider_id: riderId,
        report_date: reportDate,
        screenshot_url: screenshotUrl,
        small_count: small,
        medium_count: medium,
        small_price: smallPrice,
        medium_price: mediumPrice,
        total_amount: totalAmount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'rider_id,report_date' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, totalAmount });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const riderId = searchParams.get('riderId');
  const reportDate = searchParams.get('date');

  const { data: pricing } = await supabaseAdmin
    .from('jumia_pricing')
    .select('small_price, medium_price')
    .eq('id', 1)
    .single();

  let existingReport = null;
  if (riderId && reportDate) {
    const { data } = await supabaseAdmin
      .from('jumia_reports')
      .select('*')
      .eq('rider_id', riderId)
      .eq('report_date', reportDate)
      .maybeSingle();
    existingReport = data;
  }

  return NextResponse.json({
    pricing: { small: pricing?.small_price || 0, medium: pricing?.medium_price || 0 },
    existingReport,
  });
}