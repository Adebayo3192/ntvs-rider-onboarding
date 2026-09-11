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