'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError('Invalid email or password. Please try again.');
    } else {
      router.push('/admin/dashboard');
    }
  };

  const inputWrap = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 42,
    padding: '0 13px',
    borderRadius: 14,
    background: '#fff',
    border: '1px solid #DFE7E2',
    boxSizing: 'border-box',
  };

  const inputStyle = {
    flex: 1,
    minWidth: 0,
    border: 'none',
    background: 'transparent',
    fontFamily: FONT,
    fontSize: 13,
    fontWeight: 500,
    color: '#10281C',
    outline: 'none',
  };

  const fieldLabel = {
    display: 'block',
    fontSize: 12,
    fontWeight: 800,
    color: '#2D4038',
    marginBottom: 5,
    fontFamily: FONT,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: FONT }}>
      {/* Left branding panel */}
      <div
        style={{
          flex: '0 0 40%',
          minWidth: 380,
          background: 'linear-gradient(180deg, #0B2418 0%, #0E2A1D 40%, #14432A 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '36px 48px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src="/logo.png"
          alt="NTVS"
          style={{ width: 96, height: 96, objectFit: 'contain', filter: 'drop-shadow(0 14px 32px rgba(0,0,0,.45))' }}
        />

        <h1 style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 800, letterSpacing: '-1.4px', textAlign: 'center' }}>
          NTVS Delivery
        </h1>
        <span style={{ marginTop: 5, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.72)' }}>
          Admin Portal
        </span>
        <span style={{ marginTop: 10, width: 50, height: 3, borderRadius: 2, background: '#05C16A' }} />
        <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: 1.35, fontWeight: 600, color: 'rgba(255,255,255,.86)', textAlign: 'center', maxWidth: 240 }}>
          Building a stronger delivery network together
        </p>

        <div style={{ flex: 1, minHeight: 20 }} />

        <img
          src="/sidebar-illustration.svg"
          alt=""
          style={{ width: 'calc(100% + 96px)', margin: '0 -48px 0', display: 'block' }}
        />

        <div
          style={{
            width: 'calc(100% + 96px)',
            margin: '0 -48px 0',
            display: 'flex',
            alignItems: 'center',
            padding: '10px 30px',
            background: '#0B2418',
          }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-3z" stroke="#4FE39C" strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M9 12.2l2.2 2.2 4-4.4" stroke="#4FE39C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 10, lineHeight: 1.25, fontWeight: 600, color: 'rgba(255,255,255,.86)' }}>
              Safe<br />Deliveries
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="8" r="3" stroke="#4FE39C" strokeWidth="1.9" />
              <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="#4FE39C" strokeWidth="1.9" strokeLinecap="round" />
              <circle cx="17" cy="9" r="2.4" stroke="#4FE39C" strokeWidth="1.7" />
              <path d="M15.5 20c0-2.6 1.8-4.5 4.5-4.5" stroke="#4FE39C" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 10, lineHeight: 1.25, fontWeight: 600, color: 'rgba(255,255,255,.86)' }}>
              Stronger<br />Communities
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V14M11 20V10M18 20V4" stroke="#4FE39C" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 10, lineHeight: 1.25, fontWeight: 600, color: 'rgba(255,255,255,.86)' }}>
              A Better<br />Tomorrow
            </span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          background: '#F7FBF8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -100,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,164,92,.14) 0%, rgba(15,164,92,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            left: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,164,92,.10) 0%, rgba(15,164,92,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <form
          onSubmit={handleLogin}
          style={{
            width: '100%',
            maxWidth: 460,
            background: '#fff',
            borderRadius: 18,
            border: '1px solid #E7ECE8',
            boxShadow: '0 24px 60px rgba(14,42,29,.1)',
            padding: '22px 24px 18px',
            boxSizing: 'border-box',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#10281C', textAlign: 'center' }}>
            Welcome back
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7C8A83', textAlign: 'center' }}>
            Sign in to manage rider applications
          </p>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 12,
                padding: '9px 12px',
                borderRadius: 12,
                background: '#FDE4E6',
                color: '#E5484D',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <AlertCircle size={18} style={{ flex: 'none' }} />
              {error}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <label style={fieldLabel}>Email address</label>
            <div style={inputWrap}>
              <Mail size={18} color="#8E9B94" style={{ flex: 'none' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ntvs.com"
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={fieldLabel}>Password</label>
            <div style={inputWrap}>
              <Lock size={18} color="#8E9B94" style={{ flex: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flex: 'none' }}
              >
                {showPassword ? <EyeOff size={18} color="#8E9B94" /> : <Eye size={18} color="#8E9B94" />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <a href="#" style={{ fontSize: 11.5, fontWeight: 700, color: ACCENT, textDecoration: 'underline' }}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 12,
              width: '100%',
              height: 44,
              border: 'none',
              borderRadius: 15,
              cursor: loading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontFamily: FONT,
              fontSize: 13.5,
              fontWeight: 800,
              color: '#fff',
              background: `linear-gradient(100deg, #0BAE5E, ${ACCENT})`,
              boxShadow: '0 12px 26px rgba(5,193,106,.3)',
            }}
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            {!loading && <ArrowRight size={20} color="#fff" />}
          </button>

          <hr style={{ margin: '14px 0 12px', border: 'none', borderTop: '1px solid #E7ECE8' }} />

          <p style={{ margin: 0, textAlign: 'center', fontSize: 10.5, color: '#9AA8A0' }}>
            NTVS Delivery&nbsp;&nbsp;|&nbsp;&nbsp;Admin Portal
            <br />
            © 2026 Nouradine Top Cash Ventures. All rights reserved.
          </p>
        </form>
      </div>
    </div>
  );
}