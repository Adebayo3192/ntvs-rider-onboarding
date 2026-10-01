import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

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
  const { id } = await params;

  const { data: rider, error: riderError } = await supabaseAdmin
    .from('riders')
    .select('*')
    .eq('id', id)
    .single();

  if (riderError || !rider) {
    return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
  }

  // Fetch guarantor rows without .single() so we can see exactly what's
  // there: zero rows, one row, or (the known failure mode) duplicates.
  // .single() throws away rows on anything other than exactly one match
  // and we were discarding its error, so a duplicate-row rider would
  // silently show guarantor: null with no trace of why.
  const { data: guarantorRows, error: guarantorError } = await supabaseAdmin
    .from('guarantors')
    .select('*')
    .eq('rider_id', id);

  if (guarantorError) {
    console.error(`Guarantor lookup failed for rider ${id}:`, guarantorError);
  }
  if (guarantorRows && guarantorRows.length > 1) {
    console.error(
      `Rider ${id} has ${guarantorRows.length} guarantor rows (expected 1). Using the most recent one. Row ids: ${guarantorRows.map((g) => g.id).join(', ')}`
    );
  }

  // Most recently created guarantor row wins if there happen to be duplicates.
  const guarantor =
    guarantorRows && guarantorRows.length > 0
      ? [...guarantorRows].sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        )[0]
      : null;

  const ghanaIdSignedUrl = await signUrl(rider.ghana_id_image_url);
  const licenseSignedUrl = await signUrl(rider.license_image_url);
  const guarantorGhanaIdSignedUrl = guarantor ? await signUrl(guarantor.ghana_id_image_url) : null;

  return NextResponse.json({
    rider: { ...rider, ghana_id_signed_url: ghanaIdSignedUrl, license_signed_url: licenseSignedUrl },
    guarantor: guarantor ? { ...guarantor, ghana_id_signed_url: guarantorGhanaIdSignedUrl } : null,
  });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const { error: riderError } = await supabaseAdmin
    .from('riders')
    .update({
      full_name: body.fullName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      ghana_id_number: body.ghanaIdNumber,
      license_number: body.licenseNumber,
    })
    .eq('id', id);

  if (riderError) {
    return NextResponse.json({ error: riderError.message }, { status: 500 });
  }

  if (body.guarantor) {
    const { error: guarantorError } = await supabaseAdmin
      .from('guarantors')
      .update({
        full_name: body.guarantor.fullName,
        phone: body.guarantor.phone,
        email: body.guarantor.email,
        address: body.guarantor.address,
        ghana_id_number: body.guarantor.ghanaIdNumber,
      })
      .eq('rider_id', id);

    if (guarantorError) {
      return NextResponse.json({ error: guarantorError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('riders')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}