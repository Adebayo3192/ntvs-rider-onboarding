import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getCaller, unauthorized, forbidden } from '@/lib/apiAuth';

// Settlements are an admin-only concern — this is where money actually
// gets marked paid. A jumia_reviewer account's only job is to approve or
// reject a day's numbers; it should never be able to settle a payment,
// even by calling this API directly (bypassing the UI, which already
// hides this page from them). So every handler below requires role
// === 'admin', not just "someone logged in".
function requireAdmin(caller) {
  return caller && caller.role === 'admin';
}

// GET ?riderId=xxx -> unsettled + settled reports for that rider
// GET (no params) -> list of riders who have any unsettled reports, with counts
export async function GET(request) {
  const caller = await getCaller(request);
  if (!caller) return unauthorized();
  if (!requireAdmin(caller)) return forbidden();

  const { searchParams } = new URL(request.url);
  const riderId = searchParams.get('riderId');

  if (riderId) {
    const { data: unsettled, error: e1 } = await supabaseAdmin
      .from('jumia_reports')
      .select('id, report_date, small_count, medium_count, total_amount, approval_status')
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
  const caller = await getCaller(request);
  if (!caller) return unauthorized();
  if (!requireAdmin(caller)) return forbidden();

  const { riderId, reportIds } = await request.json();

  if (!riderId || !Array.isArray(reportIds) || reportIds.length === 0) {
    return NextResponse.json({ error: 'Missing rider or report selection' }, { status: 400 });
  }

  // Only reports that are unsettled AND approved can actually be settled.
  // A rejected or still-pending day is silently excluded here rather than
  // trusted from the request body — this is the one place money actually
  // moves, so it re-verifies against the database instead of the client's
  // selection.
  const { data: reports, error: fetchError } = await supabaseAdmin
    .from('jumia_reports')
    .select('id, total_amount')
    .in('id', reportIds)
    .eq('rider_id', riderId)
    .eq('settled', false)
    .eq('approval_status', 'approved');

  if (fetchError || !reports || reports.length === 0) {
    return NextResponse.json({ error: 'No valid, approved, unsettled reports found in that selection' }, { status: 400 });
  }

  const approvedIds = reports.map((r) => r.id);
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

  // IMPORTANT: update exactly the ids we verified above (approvedIds), never
  // the raw reportIds from the request — otherwise an unapproved report
  // slipped into the selection would get marked settled anyway even though
  // it was excluded from the total.
  const { error: updateError } = await supabaseAdmin
    .from('jumia_reports')
    .update({ settled: true, settlement_id: settlement.id })
    .in('id', approvedIds);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const skipped = reportIds.length - approvedIds.length;

  return NextResponse.json({
    success: true,
    totalAmount,
    daysSettled: reports.length,
    skipped, // how many selected reports were excluded for not being approved yet
  });
}