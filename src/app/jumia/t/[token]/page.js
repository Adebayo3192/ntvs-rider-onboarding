import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import PinClient from './PinClient';

// The URL itself is the secret, so keep it out of search engines and out
// of the Referer header sent to anything this page loads or links to.
export const metadata = {
  title: 'Jumia Delivery Reports',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function JumiaPrivateLinkPage({ params }) {
  const { token } = await params;

  if (!UUID_RE.test(token)) notFound();

  const { data: rider } = await supabaseAdmin
    .from('riders')
    .select('full_name, jumia_pin, jumia_enabled, jumia_locked')
    .eq('jumia_token', token)
    .maybeSingle();

  // Same 404 for "no such token" and "not enabled" — never reveal which.
  if (!rider || !rider.jumia_enabled) notFound();

  return (
    <PinClient
      token={token}
      riderName={rider.full_name}
      hasPin={!!rider.jumia_pin}
      locked={!!rider.jumia_locked}
    />
  );
}
