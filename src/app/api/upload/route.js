import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const token = formData.get('token');

  if (!file || !token) {
    return NextResponse.json({ error: 'Missing file or token' }, { status: 400 });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${token}/${crypto.randomUUID()}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabaseAdmin.storage
    .from('rider-documents')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage
    .from('rider-documents')
    .getPublicUrl(fileName);

  return NextResponse.json({ url: data.publicUrl });
}