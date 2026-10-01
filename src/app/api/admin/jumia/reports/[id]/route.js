import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getCaller, unauthorized } from '@/lib/apiAuth';

async function signUrl(storedUrl) {
  if (!storedUrl) return null;
  const marker = '/public/rider-documents/';
  const idx = storedUrl.indexOf(marker);
  if (idx === -1) return storedUrl;
  const path = storedUrl.slice(idx + marker.length);

  const { data, error } = await supabaseAdmin.storage
    .from('rider-documents')
    .createSignedUrl(path, 3600);

  if (error) return null;
  return data.signedUrl;
}

export async function GET(request, { params }) {
  // Either role can view a single report's detail — a reviewer opens this
  // to see the screenshot and numbers before approving/rejecting it.
  const caller = await getCaller(request);
  if (!caller) return unauthorized();

  const { id } = await params;

  const { data: report, error } = await supabaseAdmin
    .from('jumia_reports')
    .select('*, riders(full_name, phone)')
    .eq('id', id)
    .single();

  if (error || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const signedUrl = await signUrl(report.screenshot_url);

  return NextResponse.json({ ...report, signed_screenshot_url: signedUrl });
}

// Approve or reject a day's submission. This is independent of `settled` —
// approving/rejecting here is the Jumia office's sign-off on the numbers,
// not a payment action. Rejecting requires a reason so the rider/admin
// knows what to fix. Either role may call this — approving/rejecting is
// exactly what the jumia_reviewer account exists to do.
export async function PATCH(request, { params }) {
  const caller = await getCaller(request);
  if (!caller) return unauthorized();

  const { id } = await params;
  const body = await request.json();
  const { approvalStatus, approvalNote } = body;

  if (!['approved', 'rejected', 'pending'].includes(approvalStatus)) {
    return NextResponse.json({ error: 'Invalid approval status' }, { status: 400 });
  }

  if (approvalStatus === 'rejected' && !approvalNote?.trim()) {
    return NextResponse.json({ error: 'A reason is required to reject a report' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('jumia_reports')
    .update({
      approval_status: approvalStatus,
      approval_note: approvalStatus === 'rejected' ? approvalNote.trim() : null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}