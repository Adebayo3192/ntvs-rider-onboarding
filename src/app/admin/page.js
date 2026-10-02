'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, Users, Zap } from 'lucide-react';

// Matches the shared NTVL design tokens (see src/lib/theme.js) — the
// native OS system font stack, same accent green as the homepage.
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError('Invalid email or password. Please try again.');
    } else {
      // Send a Jumia reviewer straight to their queue instead of the main
      // admin dashboard — the dashboard layout used to redirect them there
      // a moment *after* first rendering the full admin home screen,
      // which showed up as a visible flash of the wrong page on login.
      // Routing correctly from here, using the role we already have from
      // sign-in, skips that detour entirely.
      const role = data?.user?.user_metadata?.role;
      router.push(role === 'jumia_reviewer' ? '/admin/dashboard/jumia' : '/admin/dashboard');
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

  const trustItems = [
    { icon: ShieldCheck, label: ['Safe', 'Deliveries'] },
    { icon: Users, label: ['Stronger', 'Communities'] },
    { icon: Zap, label: ['A Better', 'Tomorrow'] },
  ];

  return (
    <div className="ntvl-login-shell" style={{ height: '100dvh', display: 'flex', fontFamily: FONT, overflow: 'hidden' }}>
      {/* Left branding panel — now the same hero photo used on the public
          homepage, with the dark gradient treatment from the homepage's
          rider-recruitment banner, instead of the old flat illustration.
          This ties the admin portal visually back to the public site. */}
      <div
        className="ntvl-login-brand"
        style={{
          flex: '0 0 40%',
          minWidth: 380,
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <img
          src="/hero-rider.jpg"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(8,31,20,.93) 15%, rgba(18,69,43,.88) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            padding: '22px 48px 0',
            color: '#fff',
            boxSizing: 'border-box',
          }}
        >
          <img
            src="/logo.png"
            alt="NTVS"
            className="ntvl-login-logo"
            style={{ width: 96, height: 96, objectFit: 'contain', filter: 'drop-shadow(0 14px 32px rgba(0,0,0,.45))' }}
          />

          <h1 style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 800, letterSpacing: '-1.4px', textAlign: 'center' }}>
            NTVS Delivery
          </h1>
          <span style={{ marginTop: 5, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.72)' }}>
            Admin Portal
          </span>
          <span style={{ marginTop: 10, width: 50, height: 3, borderRadius: 2, background: '#05C16A' }} />

          {/* Caveat script accent — same handwritten-tag treatment as the
              homepage hero photo's "Delivering a Better Tomorrow" label */}
          <p
            className="ntvl-login-caveat"
            style={{
              margin: '16px 0 0',
              fontFamily: "'Caveat', cursive",
              fontSize: 23,
              fontWeight: 600,
              color: '#fff',
              textAlign: 'center',
              maxWidth: 260,
              lineHeight: 1.15,
              transform: 'rotate(-2deg)',
            }}
          >
            Building a stronger delivery network, together
          </p>

          <div className="ntvl-login-spacer" style={{ flex: 1, minHeight: 20 }} />

          <div
            className="ntvl-login-trust-row"
            style={{
              width: 'calc(100% + 96px)',
              margin: '0 -48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '20px 20px 26px',
              background: 'rgba(7,26,17,.5)',
              backdropFilter: 'blur(3px)',
              borderTop: '1px solid rgba(255,255,255,.12)',
              boxSizing: 'border-box',
            }}
          >
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label.join(' ')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, textAlign: 'center' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'rgba(79,227,156,.16)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  <Icon size={16} color="#4FE39C" />
                </div>
                <span style={{ fontSize: 10, lineHeight: 1.25, fontWeight: 600, color: 'rgba(255,255,255,.86)' }}>
                  {label[0]}<br />{label[1]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div
        className="ntvl-login-form"
        style={{
          flex: 1,
          height: '100%',
          // Warm mint-to-cream gradient instead of flat near-white —
          // same base tones as the homepage sections — plus the dot
          // texture and color blobs below give it real depth instead of
          // reading as an empty page around the card.
          background: 'linear-gradient(135deg, #F3FAF6 0%, #F5F7F2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Small repeated logo watermark instead of plain dots — same
            fade-around-the-card treatment, but it's actually the NTVL
            mark rather than a generic texture. */}
        <div className="ntvl-login-dots" />

        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -100,
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,164,92,.20) 0%, rgba(15,164,92,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -170,
            left: -130,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,164,92,.16) 0%, rgba(15,164,92,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <form
          onSubmit={handleLogin}
          style={{
            position: 'relative',
            zIndex: 1,
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

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 20,
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

      <style>{`
        .ntvl-login-dots {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .09;
          background-image: url('/logo.png');
          background-repeat: repeat;
          background-size: 46px 46px;
          background-position: 0 0;
          /* Fades the watermark out in a circle centered on the card, so
             it reads at the edges but never shows through the form. */
          -webkit-mask-image: radial-gradient(circle at 50% 45%, transparent 0px, transparent 220px, black 460px);
          mask-image: radial-gradient(circle at 50% 45%, transparent 0px, transparent 220px, black 460px);
        }

        /* On narrow screens, the brand panel used to disappear entirely,
           leaving a bare white page around the form — instead it becomes a
           shorter photo banner across the top, so the page still carries
           the hero photo and brand color rather than going blank. */
        @media (max-width: 767px) {
          .ntvl-login-shell {
            flex-direction: column !important;
            height: auto !important;
            min-height: 100dvh !important;
            overflow: visible !important;
          }
          .ntvl-login-brand {
            flex: 0 0 auto !important;
            width: 100% !important;
            min-width: 0 !important;
            height: 190px !important;
            padding: 18px 24px !important;
          }
          .ntvl-login-logo { width: 56px !important; height: 56px !important; }
          .ntvl-login-caveat,
          .ntvl-login-trust-row,
          .ntvl-login-spacer {
            display: none !important;
          }
          .ntvl-login-form {
            flex: 1 1 auto !important;
            height: auto !important;
            padding: 28px 16px 40px !important;
          }
        }
      `}</style>
    </div>
  );
}