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

  if (rider.locked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0E2A1D, #173D28)', color: '#fff', padding: 24, textAlign: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>This application has already been reviewed</h1>
          <p style={{ color: '#B7D4C4' }}>Contact the shop if you believe this is a mistake.</p>
        </div>
      </div>
    );
  }

  return <RegisterClient token={token} />;
}