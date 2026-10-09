import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getJumiaRider, jumiaUnauthorized } from '@/lib/jumiaAuth';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toCount(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

// The rider id always comes from the verified session cookie (getJumiaRider),
// never from the URL or the request body — otherwise anyone could read or
// overwrite another rider's report just by changing an id.
export async function POST(request) {
  const rider = await getJumiaRider(request);
  if (!rider) return jumiaUnauthorized();

  const body = await request.json().catch(() => null);
  const { reportDate, screenshotUrl } = body || {};
  const small = toCount(body?.small);
  const medium = toCount(body?.medium);

  if (!reportDate || !DATE_RE.test(reportDate) || small === null || medium === null) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
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
    .eq('rider_id', rider.id)
    .eq('report_date', reportDate)
    .maybeSingle();

  if (existing?.settled) {
    return NextResponse.json({ error: 'This day has already been settled and can no longer be edited.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('jumia_reports')
    .upsert(
      {
        rider_id: rider.id,
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
  const rider = await getJumiaRider(request);
  if (!rider) return jumiaUnauthorized();

  const { searchParams } = new URL(request.url);
  const reportDate = searchParams.get('date');

  const { data: pricing } = await supabaseAdmin
    .from('jumia_pricing')
    .select('small_price, medium_price')
    .eq('id', 1)
    .single();

  let existingReport = null;
  if (reportDate && DATE_RE.test(reportDate)) {
    const { data } = await supabaseAdmin
      .from('jumia_reports')
      .select('small_count, medium_count, screenshot_url, settled')
      .eq('rider_id', rider.id)
      .eq('report_date', reportDate)
      .maybeSingle();
    existingReport = data;
  }

  return NextResponse.json({
    pricing: { small: pricing?.small_price || 0, medium: pricing?.medium_price || 0 },
    existingReport,
  });
}
