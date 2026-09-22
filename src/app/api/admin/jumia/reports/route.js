import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const period = searchParams.get('period') || 'all'; // 'all' | 'week'

  let query = supabaseAdmin
    .from('jumia_reports')
    .select('id, report_date, small_count, medium_count, total_amount, settled, screenshot_url, riders(full_name)')
    .order('report_date', { ascending: false });

  if (period === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    query = query.gte('report_date', weekAgo.toISOString().slice(0, 10));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let reports = data.map((r) => ({
    id: r.id,
    name: r.riders?.full_name || 'Unknown',
    date: r.report_date,
    small: r.small_count,
    medium: r.medium_count,
    amount: r.total_amount,
    status: r.settled ? 'Settled' : 'Unsettled',
  }));

  if (search) {
    reports = reports.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  }

  return NextResponse.json(reports);
}