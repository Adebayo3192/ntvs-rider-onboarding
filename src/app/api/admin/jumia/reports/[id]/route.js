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