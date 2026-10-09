import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';
import { getJumiaRider } from '@/lib/jumiaAuth';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — comfortably above a phone camera photo
const TOKEN_RE = /^[A-Za-z0-9-]{8,100}$/;

// Works out the image type from the file's first bytes instead of trusting
// the name or content type the browser sent, so a renamed script or HTML
// file can't be stored (and later served) as if it were a photo.
function sniffImage(buffer) {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { ext: 'jpg', type: 'image/jpeg' };
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: 'png', type: 'image/png' };
  if (buffer.toString('latin1', 0, 4) === 'RIFF' && buffer.toString('latin1', 8, 12) === 'WEBP') return { ext: 'webp', type: 'image/webp' };
  if (buffer.toString('latin1', 4, 8) === 'ftyp') {
    const brand = buffer.toString('latin1', 8, 12);
    if (['heic', 'heix', 'hevc', 'mif1', 'msf1', 'heif'].includes(brand)) return { ext: 'heic', type: 'image/heic' };
  }
  return null;
}

// Riders upload here without an admin login, so the caller has to prove
// they're a real rider one of two ways. Returns the storage folder for
// their files, or null if neither check passes.
//   1. Onboarding: the form's token matches a rider's onboarding_token and
//      that application hasn't been locked (approved/rejected) yet.
//   2. Jumia report: a valid signed Jumia session cookie.
async function resolveFolder(request, token) {
  if (typeof token === 'string' && TOKEN_RE.test(token)) {
    const { data: applicant } = await supabaseAdmin
      .from('riders')
      .select('id, locked')
      .eq('onboarding_token', token)
      .maybeSingle();
    if (applicant && !applicant.locked) return token;
  }

  const jumiaRider = await getJumiaRider(request);
  if (jumiaRider) return `jumia-${jumiaRider.id}`;

  return null;
}

export async function POST(request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 });
  }

  const folder = await resolveFolder(request, formData.get('token'));
  if (!folder) {
    return NextResponse.json({ error: 'You are not allowed to upload here. Open your link again and retry.' }, { status: 401 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'That photo is too large. The limit is 10 MB.' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const image = sniffImage(buffer);
  if (!image) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP or HEIC photos can be uploaded.' }, { status: 415 });
  }

  const fileName = `${folder}/${crypto.randomUUID()}.${image.ext}`;

  const { error } = await supabaseAdmin.storage
    .from('rider-documents')
    .upload(fileName, buffer, {
      contentType: image.type,
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
