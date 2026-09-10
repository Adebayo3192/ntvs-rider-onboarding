'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0E2A1D, #173D28)', color: '#fff', padding: 24, textAlign: 'center' }}>
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0E2A1D, #173D28)', color: '#fff', padding: '32px 20px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#05C16A', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>
            NTVS
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Join the NTVS Rider Network</h1>
          <p style={{ color: '#B7D4C4', fontSize: 14 }}>Nouradine Top Cash Ventures — Fast and Reliable</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Rules & Regulations</h2>
          <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#DCEFE3' }}>
            {RULES.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ol>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, fontSize: 14, color: '#DCEFE3' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ marginTop: 3, width: 18, height: 18 }}
          />
          I have read and agree to the Terms & Conditions above
        </label>

        <button
          onClick={handleContinue}
          disabled={!agreed}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 14,
            border: 'none',
            fontSize: 16,
            fontWeight: 700,
            cursor: agreed ? 'pointer' : 'not-allowed',
            background: agreed ? '#05C16A' : '#3A5347',
            color: '#fff',
          }}
        >
          Continue to Registration
        </button>
      </div>
    </div>
  );
}