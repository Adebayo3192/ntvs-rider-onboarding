import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const archived = searchParams.get('archived') === 'true';

  let query = supabaseAdmin
    .from('riders')
    .select('id, full_name, phone, status, submitted_at, archived')
    .not('submitted_at', 'is', null)
    .eq('archived', archived)
    .order('submitted_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}