import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('riders')
    .select('id, full_name, jumia_pin')
    .eq('jumia_enabled', true)
    .not('submitted_at', 'is', null)
    .order('full_name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Only expose whether a PIN is set, never the PIN value itself
  const riders = data.map((r) => ({
    id: r.id,
    name: r.full_name,
    hasPin: !!r.jumia_pin,
  }));

  return NextResponse.json(riders);
}