import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notFound } from 'next/navigation';
import LandingClient from './LandingClient';

export default async function OnboardingPage({ params }) {
  const { token } = await params;

  const { data: rider, error } = await supabaseAdmin
    .from('riders')
    .select('id, status, locked')
    .eq('onboarding_token', token)
    .single();

  if (error || !rider) {
    notFound();
  }

  return <LandingClient token={token} rider={rider} />;
}