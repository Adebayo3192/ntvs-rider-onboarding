import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getCaller, unauthorized } from '@/lib/apiAuth';

export async function GET(request) {
  // Read-only: any logged-in admin or jumia_reviewer account.
  const caller = await getCaller(request);
  if (!caller) return unauthorized();

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month'; // month | last_month | all
  const search = (searchParams.get('search') || '').trim().toLowerCase();

  const { data: allReports } = await supabaseAdmin
    .from('jumia_reports')
    .select('rider_id, report_date, small_count, medium_count, total_amount, riders(full_name)');

  const now = new Date();
  let rangeStart = null;
  let rangeEnd = null;
  if (period === 'month') {
    rangeStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  } else if (period === 'last_month') {
    rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
    rangeEnd = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  }

  const filtered = (allReports || []).filter((r) => {
    if (rangeStart && r.report_date < rangeStart) return false;
    if (rangeEnd && r.report_date >= rangeEnd) return false;
    return true;
  });

  const byRider = {};
  filtered.forEach((r) => {
    const key = r.rider_id;
    if (!byRider[key]) {
      byRider[key] = { name: r.riders?.full_name || 'Rider', reports: 0, small: 0, medium: 0, amount: 0 };
    }
    byRider[key].reports += 1;
    byRider[key].small += r.small_count;
    byRider[key].medium += r.medium_count;
    byRider[key].amount += Number(r.total_amount);
  });

  let rows = Object.values(byRider);
  if (search) rows = rows.filter((r) => r.name.toLowerCase().includes(search));
  rows.sort((a, b) => b.amount - a.amount);
  rows = rows.map((r, i) => ({
    ...r,
    rank: i + 1,
    packages: r.small + r.medium,
    avgPerReport: r.reports ? r.amount / r.reports : 0,
  }));

  return NextResponse.json({ period, rows });
}