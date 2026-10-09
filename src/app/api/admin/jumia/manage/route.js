import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getCaller, unauthorized } from '@/lib/apiAuth';

export async function GET(request) {
  // Read-only: any logged-in admin or jumia_reviewer account.
  const caller = await getCaller(request);
  if (!caller) return unauthorized();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  let query = supabaseAdmin
    .from('riders')
    .select('id, full_name, phone, jumia_enabled, jumia_pin, jumia_locked')
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
    locked: !!r.jumia_locked,
  }));

  return NextResponse.json(riders);
}