'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#05C16A';

const RULES = [
  'Riders must report early for dispatch each working day, as scheduled by the shop.',
  'All cash collected must be settled and reported daily; no carrying over settlement to the next day without approval.',
  'Undelivered or returned packages must be handed back to the shop the same day — packages must never be taken home overnight.',
  'Cash collected on deliveries must never be kept overnight; it must be handed in as part of daily settlement.',
  'Riders must treat customers, shop staff, and fellow riders with full respect at all times.',
  'All personal, ID, and guarantor information provided must be true and verifiable.',
  'Packages must be handled with care; damage caused by negligence may be deducted from earnings.',
  'Riders must inform the shop immediately of any delay, breakdown, accident, or inability to complete a delivery.',
  'Riders must carry their license and be identifiable while on active deliveries.',
  'Falsifying settlement records, withholding payment, or misreporting delivery status results in immediate termination and possible legal action.',
  "The guarantor is responsible for vouching for the rider's conduct and may be contacted regarding serious violations.",
];

export default function LandingClient({ token, rider }) {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  if (rider.locked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(170deg, #0E2A1D 0%, #173D28 100%)', color: '#fff', padding: 24, textAlign: 'center', fontFamily: FONT }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>This application has already been reviewed</h1>
          <p style={{ color: '#B7D4C4' }}>Contact the shop if you believe this is a mistake.</p>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    router.push(`/onboarding/${token}/register`);
  };

  const agreeStyle = {
    display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer',
    padding: '13px 14px', minHeight: 56, boxSizing: 'border-box',
    borderRadius: 16, userSelect: 'none',
    background: agreed ? 'rgba(5,193,106,.12)' : 'rgba(255,255,255,.05)',
    border: '1px solid ' + (agreed ? 'rgba(5,193,106,.45)' : 'rgba(255,255,255,.12)'),
    transition: 'background .18s, border-color .18s',
  };

  const boxStyle = {
    flex: 'none', width: 26, height: 26, borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: agreed ? ACCENT : 'transparent',
    border: '2px solid ' + (agreed ? ACCENT : 'rgba(255,255,255,.45)'),
    transition: 'background .18s, border-color .18s',
  };

  const btnStyle = {
    marginTop: 12, width: '100%', height: 58, border: 'none', borderRadius: 18,
    fontFamily: FONT, fontSize: 16.5, fontWeight: 700,
    cursor: agreed ? 'pointer' : 'not-allowed',
    background: agreed ? ACCENT : 'rgba(255,255,255,.09)',
    color: agreed ? '#06281A' : 'rgba(255,255,255,.35)',
    boxShadow: agreed ? '0 12px 28px rgba(5,193,106,.32)' : 'none',
    transition: 'background .18s, color .18s, box-shadow .18s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(170deg, #0E2A1D 0%, #173D28 100%)', fontFamily: FONT, color: '#fff' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '48px 22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
          src="/logo.png"
          alt="NTVS"
          style={{ width: 112, height: 112, objectFit: 'contain', display: 'block', flex: 'none', filter: 'drop-shadow(0 10px 24px rgba(0,0,0,.45))' }}
        />

        <h1 style={{ margin: '22px 0 0', fontSize: 27, lineHeight: 1.2, fontWeight: 800, letterSpacing: '-.5px', textAlign: 'center' }}>
          Join the NTVS Rider Network
        </h1>
        <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.5, fontWeight: 500, color: 'rgba(255,255,255,.72)', textAlign: 'center', maxWidth: 280 }}>
          Nouradine Top Cash Ventures — Fast and Reliable
        </p>

        <div style={{ marginTop: 26, width: '100%', flex: 'none', background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 22, boxShadow: '0 18px 40px rgba(0,0,0,.3)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 18px 14px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, boxShadow: '0 0 0 4px rgba(5,193,106,.18)' }} />
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '.2px' }}>Rules &amp; Regulations</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.5)' }}>{RULES.length} rules</span>
          </div>
          <ol style={{ listStyle: 'none', margin: 0, padding: '6px 18px 18px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {RULES.map((rule, i) => (
              <li key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                <span style={{ flex: 'none', width: 26, height: 26, borderRadius: 9, background: 'rgba(5,193,106,.16)', color: '#4FE39C', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.62, fontWeight: 500, color: 'rgba(255,255,255,.9)' }}>{rule}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div style={{ flex: 'none', padding: '14px 22px 30px', background: 'linear-gradient(to top,#173D28 62%,rgba(23,61,40,0))', backdropFilter: 'blur(8px)' }}>
        <div onClick={() => setAgreed((a) => !a)} role="checkbox" aria-checked={agreed} style={agreeStyle}>
          <span style={boxStyle}>
            <svg width="14" height="14" viewBox="0 0 14 14" style={{ opacity: agreed ? 1 : 0, transition: 'opacity .15s' }}>
              <path d="M2.5 7.4l3 3 6-6.4" fill="none" stroke="#06281A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span style={{ fontSize: 13.5, lineHeight: 1.45, fontWeight: 600, color: 'rgba(255,255,255,.92)' }}>
            I have read and agree to the Terms &amp; Conditions above
          </span>
        </div>
        <button onClick={handleContinue} disabled={!agreed} style={btnStyle}>
          Continue to Registration
        </button>
      </div>
    </div>
  );
}