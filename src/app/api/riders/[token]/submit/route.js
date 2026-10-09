import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { notifyAdminOfSubmission } from '@/lib/email';

export async function POST(request, { params }) {
  const { token } = await params;
  const body = await request.json();

  const { data: existing } = await supabaseAdmin
    .from('riders')
    .select('id, locked')
    .eq('onboarding_token', token)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'This link is not valid.' }, { status: 404 });
  }

  // Once an application has been approved or rejected it is locked — the
  // onboarding link must no longer be able to overwrite the reviewed details.
  if (existing.locked) {
    return NextResponse.json(
      { error: 'This application has already been reviewed and can no longer be changed.' },
      { status: 403 }
    );
  }

  const { data: rider, error: riderError } = await supabaseAdmin
    .from('riders')
    .update({
      full_name: body.fullName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      ghana_id_number: body.ghanaIdNumber,
      ghana_id_image_url: body.ghanaIdImageUrl,
      license_number: body.licenseNumber,
      license_image_url: body.licenseImageUrl,
      latitude: body.latitude,
      longitude: body.longitude,
      submitted_at: new Date().toISOString(),
    })
    .eq('onboarding_token', token)
    // Re-checked in the update itself, so a submit racing an admin's
    // approve/reject can't slip in after the check above.
    .not('locked', 'is', true)
    .select('id')
    .maybeSingle();

  if (riderError) {
    return NextResponse.json({ error: riderError.message }, { status: 500 });
  }

  if (!rider) {
    return NextResponse.json(
      { error: 'This application has already been reviewed and can no longer be changed.' },
      { status: 403 }
    );
  }

  // Remove any existing guarantor for this rider first, so a resubmission
  // (before approval/rejection) never leaves behind a duplicate row
  await supabaseAdmin
    .from('guarantors')
    .delete()
    .eq('rider_id', rider.id);

  const { error: guarantorError } = await supabaseAdmin
    .from('guarantors')
    .insert({
      rider_id: rider.id,
      full_name: body.guarantorFullName,
      phone: body.guarantorPhone,
      email: body.guarantorEmail,
      address: body.guarantorAddress,
      ghana_id_number: body.guarantorGhanaIdNumber,
      ghana_id_image_url: body.guarantorGhanaIdImageUrl,
      latitude: body.guarantorLatitude,
      longitude: body.guarantorLongitude,
    });

  if (guarantorError) {
    return NextResponse.json({ error: guarantorError.message }, { status: 500 });
  }

  await notifyAdminOfSubmission(body.fullName);

  return NextResponse.json({ success: true });
}