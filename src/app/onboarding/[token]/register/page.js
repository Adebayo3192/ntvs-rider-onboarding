import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notFound } from 'next/navigation';
import RegisterClient from './RegisterClient';

export default async function RegisterPage({ params }) {
  const { token } = await params;

  const { data: rider, error } = await supabaseAdmin
    .from('riders')
    .select('id, status, locked')
    .eq('onboarding_token', token)
    .single();

  if (error || !rider) {
    notFound();
  }

  return <RegisterClient token={token} />;
}