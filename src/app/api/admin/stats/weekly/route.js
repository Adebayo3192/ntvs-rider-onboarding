import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from('riders')
    .select('submitted_at')
    .not('submitted_at', 'is', null)
    .gte('submitted_at', sevenDaysAgo.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build the last 7 days as labeled buckets, oldest to newest
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateKey: d.toISOString().slice(0, 10),
      count: 0,
    });
  }

  data.forEach((r) => {
    const key = r.submitted_at.slice(0, 10);
    const bucket = days.find((d) => d.dateKey === key);
    if (bucket) bucket.count += 1;
  });

  return NextResponse.json(days.map((d) => ({ d: d.label, v: d.count })));
}