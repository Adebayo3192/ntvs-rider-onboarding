import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

// GET ?riderId=xxx -> unsettled + settled reports for that rider
// GET (no params) -> list of riders who have any unsettled reports, with counts
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const riderId = searchParams.get('riderId');

  if (riderId) {
    const { data: unsettled, error: e1 } = await supabaseAdmin
      .from('jumia_reports')
      .select('id, report_date, small_count, medium_count, total_amount')
      .eq('rider_id', riderId)
      .eq('settled', false)
      .order('report_date', { ascending: true });

    const { data: settled, error: e2 } = await supabaseAdmin
      .from('jumia_reports')
      .select('id, report_date, small_count, medium_count, total_amount')
      .eq('rider_id', riderId)
      .eq('settled', true)
      .order('report_date', { ascending: false })
      .limit(20);

    if (e1 || e2) {
      return NextResponse.json({ error: (e1 || e2).message }, { status: 500 });
    }

    return NextResponse.json({ unsettled, settled });
  }

  // No riderId: list riders with pending unsettled totals
  const { data: reports, error } = await supabaseAdmin
    .from('jumia_reports')
    .select('rider_id, total_amount, riders(full_name)')
    .eq('settled', false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byRider = {};
  reports.forEach((r) => {
    if (!byRider[r.rider_id]) {
      byRider[r.rider_id] = { riderId: r.rider_id, name: r.riders?.full_name || 'Rider', count: 0, total: 0 };
    }
    byRider[r.rider_id].count += 1;
    byRider[r.rider_id].total += Number(r.total_amount);
  });

  return NextResponse.json(Object.values(byRider));
}

export async function POST(request) {
  const { riderId, reportIds } = await request.json();

  if (!riderId || !Array.isArray(reportIds) || reportIds.length === 0) {
    return NextResponse.json({ error: 'Missing rider or report selection' }, { status: 400 });
  }

  const { data: reports, error: fetchError } = await supabaseAdmin
    .from('jumia_reports')
    .select('id, total_amount')
    .in('id', reportIds)
    .eq('rider_id', riderId)
    .eq('settled', false);

  if (fetchError || !reports || reports.length === 0) {
    return NextResponse.json({ error: 'No valid unsettled reports found' }, { status: 400 });
  }

  const totalAmount = reports.reduce((sum, r) => sum + Number(r.total_amount), 0);

  const { data: settlement, error: settlementError } = await supabaseAdmin
    .from('jumia_settlements')
    .insert({
      rider_id: riderId,
      days_settled: reports.length,
      total_amount: totalAmount,
    })
    .select('id')
    .single();

  if (settlementError) {
    return NextResponse.json({ error: settlementError.message }, { status: 500 });
  }

  const { error: updateError } = await supabaseAdmin
    .from('jumia_reports')
    .update({ settled: true, settlement_id: settlement.id })
    .in('id', reportIds);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, totalAmount, daysSettled: reports.length });
}