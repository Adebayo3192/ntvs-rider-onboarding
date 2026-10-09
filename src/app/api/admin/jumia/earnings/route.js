import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getCaller, unauthorized } from '@/lib/apiAuth';

export async function GET(request) {
  // Read-only: any logged-in admin or jumia_reviewer account.
  const caller = await getCaller(request);
  if (!caller) return unauthorized();

  const { data: allReports } = await supabaseAdmin
    .from('jumia_reports')
    .select('rider_id, report_date, total_amount, settled, riders(full_name)');

  const totalAmount = (allReports || []).reduce((s, r) => s + Number(r.total_amount), 0);
  const settledAmount = (allReports || []).filter((r) => r.settled).reduce((s, r) => s + Number(r.total_amount), 0);
  const unsettledAmount = totalAmount - settledAmount;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const thisMonthAmount = (allReports || [])
    .filter((r) => r.report_date >= monthStart)
    .reduce((s, r) => s + Number(r.total_amount), 0);

  // Last 6 months, monthly totals
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      amount: 0,
    });
  }
  const monthIndex = {};
  months.forEach((m) => { monthIndex[m.key] = m; });
  (allReports || []).forEach((r) => {
    const key = r.report_date.slice(0, 7);
    if (monthIndex[key]) monthIndex[key].amount += Number(r.total_amount);
  });

  const byRider = {};
  (allReports || []).forEach((r) => {
    const key = r.rider_id;
    if (!byRider[key]) {
      byRider[key] = { name: r.riders?.full_name || 'Rider', total: 0, settled: 0, unsettled: 0, reports: 0 };
    }
    byRider[key].total += Number(r.total_amount);
    byRider[key].reports += 1;
    if (r.settled) byRider[key].settled += Number(r.total_amount);
    else byRider[key].unsettled += Number(r.total_amount);
  });
  const riderRows = Object.values(byRider).sort((a, b) => b.total - a.total);

  return NextResponse.json({
    kpis: { totalAmount, settledAmount, unsettledAmount, thisMonthAmount },
    monthly: months,
    riders: riderRows,
  });
}