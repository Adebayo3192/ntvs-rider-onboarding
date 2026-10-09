import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getCaller, unauthorized } from '@/lib/apiAuth';

export async function GET(request) {
  // Read-only: any logged-in admin or jumia_reviewer account.
  const caller = await getCaller(request);
  if (!caller) return unauthorized();

  const [{ data: allRiders }, { data: allReports }, { data: recentSettlements }] = await Promise.all([
    supabaseAdmin.from('riders').select('id, jumia_enabled').eq('status', 'approved'),
    supabaseAdmin.from('jumia_reports').select('id, rider_id, report_date, small_count, medium_count, total_amount, settled, riders(full_name)'),
    supabaseAdmin.from('jumia_settlements').select('id, rider_id, days_settled, total_amount, settled_at, settled_by, riders(full_name)').order('settled_at', { ascending: false }).limit(5),
  ]);

  const totalEnabled = (allRiders || []).filter((r) => r.jumia_enabled).length;
  const totalReports = (allReports || []).length;
  const totalSmall = (allReports || []).reduce((sum, r) => sum + r.small_count, 0);
  const totalMedium = (allReports || []).reduce((sum, r) => sum + r.medium_count, 0);
  const totalPackages = totalSmall + totalMedium;
  const totalAmount = (allReports || []).reduce((sum, r) => sum + Number(r.total_amount), 0);
  const unsettledReports = (allReports || []).filter((r) => !r.settled);
  const pendingAmount = unsettledReports.reduce((sum, r) => sum + Number(r.total_amount), 0);

  // Top performing riders this month, by report count
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const thisMonthReports = (allReports || []).filter((r) => r.report_date >= monthStart);

  const byRider = {};
  thisMonthReports.forEach((r) => {
    const key = r.rider_id;
    if (!byRider[key]) {
      byRider[key] = { name: r.riders?.full_name || 'Rider', reports: 0, small: 0, medium: 0, amount: 0 };
    }
    byRider[key].reports += 1;
    byRider[key].small += r.small_count;
    byRider[key].medium += r.medium_count;
    byRider[key].amount += Number(r.total_amount);
  });
  const topRiders = Object.values(byRider)
    .sort((a, b) => b.reports - a.reports)
    .slice(0, 5);

  // Oldest unsettled first, with days pending
  const oldestUnsettled = [...unsettledReports]
    .sort((a, b) => new Date(a.report_date) - new Date(b.report_date))
    .slice(0, 5)
    .map((r) => ({
      name: r.riders?.full_name || 'Rider',
      date: r.report_date,
      small: r.small_count,
      medium: r.medium_count,
      amount: Number(r.total_amount),
      days: Math.floor((Date.now() - new Date(r.report_date).getTime()) / 86400000),
    }));

  const recent = (recentSettlements || []).map((s) => ({
    name: s.riders?.full_name || 'Rider',
    days: s.days_settled,
    amount: Number(s.total_amount),
    on: s.settled_at,
    by: s.settled_by,
  }));

  // Last 14 days, daily aggregation — powers the trend/amount charts
  const dayKeys = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayKeys.push(d.toISOString().slice(0, 10));
  }
  const dailyMap = {};
  dayKeys.forEach((d) => {
    dailyMap[d] = { date: d, reports: 0, amount: 0, small: 0, medium: 0 };
  });
  (allReports || []).forEach((r) => {
    if (dailyMap[r.report_date]) {
      dailyMap[r.report_date].reports += 1;
      dailyMap[r.report_date].amount += Number(r.total_amount);
      dailyMap[r.report_date].small += r.small_count;
      dailyMap[r.report_date].medium += r.medium_count;
    }
  });
  const daily = dayKeys.map((d) => dailyMap[d]);

  return NextResponse.json({
    kpis: {
      totalEnabled,
      totalReports,
      totalPackages,
      totalSmall,
      totalMedium,
      totalAmount,
      pendingCount: unsettledReports.length,
      pendingAmount,
    },
    daily,
    topRiders,
    oldestUnsettled,
    recentSettlements: recent,
  });
}