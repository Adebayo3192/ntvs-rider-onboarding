import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('riders')
    .select('status')
    .not('submitted_at', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts = { pending: 0, approved: 0, rejected: 0 };
  data.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1;
  });

  return NextResponse.json(counts);
}