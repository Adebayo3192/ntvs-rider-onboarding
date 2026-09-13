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

  const { data: guarantor } = await supabaseAdmin
    .from('guarantors')
    .select('*')
    .eq('rider_id', id)
    .single();

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