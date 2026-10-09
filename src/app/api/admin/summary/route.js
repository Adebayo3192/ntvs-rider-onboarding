import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getCaller, unauthorized, forbidden } from '@/lib/apiAuth';

export async function GET(request) {
  const caller = await getCaller(request);
  if (!caller) return unauthorized();
  if (caller.role !== 'admin') return forbidden();

  const { data, error } = await supabaseAdmin
    .from('riders')
    .select('status')
    .not('submitted_at', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts = { total: data.length, pending: 0, approved: 0, rejected: 0 };
  data.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1;
  });

  return NextResponse.json(counts);
}