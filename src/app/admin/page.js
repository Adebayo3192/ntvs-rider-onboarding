'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError('Invalid email or password.');
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0E2A1D, #173D28)', padding: 20 }}>
      <form
        onSubmit={handleLogin}
        style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 360 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#05C16A', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#fff' }}>
            NTVS
          </div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>Admin Login</h1>
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: '#B7D4C4', marginBottom: 6, display: 'block' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid #2A4A38', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 16, marginBottom: 14, boxSizing: 'border-box' }}
        />

        <label style={{ fontSize: 13, fontWeight: 600, color: '#B7D4C4', marginBottom: 6, display: 'block' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid #2A4A38', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 16, marginBottom: 14, boxSizing: 'border-box' }}
        />

        {error && <p style={{ color: '#F5A3A3', fontSize: 14, marginBottom: 14 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', background: '#05C16A', color: '#fff' }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}