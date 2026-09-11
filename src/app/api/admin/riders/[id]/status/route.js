import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { status, reason } = await request.json();

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (status === 'rejected' && !reason) {
    return NextResponse.json({ error: 'A rejection reason is required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('riders')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      locked: true,
      rejection_reason: status === 'rejected' ? reason : null,
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}