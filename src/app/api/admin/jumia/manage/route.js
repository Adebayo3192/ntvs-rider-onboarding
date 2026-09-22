import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  let query = supabaseAdmin
    .from('riders')
    .select('id, full_name, phone, jumia_enabled, jumia_pin')
    .eq('status', 'approved')
    .order('full_name', { ascending: true });

  if (search) {
    query = query.ilike('full_name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const riders = data.map((r) => ({
    id: r.id,
    name: r.full_name,
    phone: r.phone,
    enabled: r.jumia_enabled,
    hasPin: !!r.jumia_pin,
  }));

  return NextResponse.json(riders);
}