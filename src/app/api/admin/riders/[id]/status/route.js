import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { notifyRiderOfDecision } from '@/lib/email';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { status, reason } = await request.json();

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (status === 'rejected' && !reason) {
    return NextResponse.json({ error: 'A rejection reason is required' }, { status: 400 });
  }

  const { data: rider, error } = await supabaseAdmin
    .from('riders')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      locked: true,
      rejection_reason: status === 'rejected' ? reason : null,
    })
    .eq('id', id)
    .select('full_name, email')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (rider?.email) {
    await notifyRiderOfDecision(rider.email, rider.full_name, status, reason);
  }

  return NextResponse.json({ success: true });
}