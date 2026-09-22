'use client';

import { useEffect, useState } from 'react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';

const fieldLabel = { display: 'block', fontSize: 12, fontWeight: 800, color: '#2D4038', marginBottom: 7 };
const inputWrap = { display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 10px', borderRadius: 12, background: '#F7FBF8', border: '1px solid #DFE7E2', boxSizing: 'border-box' };
const input = { flex: 1, minWidth: 0, border: 'none', background: 'transparent', fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#10281C', outline: 'none' };

export default function PricingPage() {
  const [small, setSmall] = useState('0.00');
  const [medium, setMedium] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/jumia/pricing')
      .then((res) => res.json())
      .then((data) => {
        setSmall(String(data.small_price ?? 0));
        setMedium(String(data.medium_price ?? 0));
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch('/api/jumia/pricing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smallPrice: parseFloat(small) || 0, mediumPrice: parseFloat(medium) || 0 }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return <div style={{ fontSize: 13, color: '#9AA8A0', fontFamily: FONT }}>Loading...</div>;
  }

  return (
    <div style={{ width: 420, maxWidth: '100%', padding: '20px 22px 22px', borderRadius: 16, background: '#fff', border: '1px solid #E7ECE8', boxShadow: '0 2px 10px rgba(18,41,31,.04)', boxSizing: 'border-box', fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 'none', width: 36, height: 36, borderRadius: 11, background: '#DCF4E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 8.5l8-4 8 4v7l-8 4-8-4v-7z" stroke={ACCENT} strokeWidth="1.9" strokeLinejoin="round" />
            <path d="M4 8.5l8 4 8-4" stroke={ACCENT} strokeWidth="1.9" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.3px', color: '#10281C' }}>Package Pricing</span>
      </div>

      <div style={{ marginTop: 18 }}>
        <label style={fieldLabel}>Price per Small Package</label>
        <div style={inputWrap}>
          <span style={{ flex: 'none', width: 26, height: 26, borderRadius: 8, background: '#F2F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 800, color: '#3A4C43' }}>₵</span>
          <input type="number" step="0.01" value={small} onChange={(e) => setSmall(e.target.value)} style={input} />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={fieldLabel}>Price per Medium Package</label>
        <div style={inputWrap}>
          <span style={{ flex: 'none', width: 26, height: 26, borderRadius: 8, background: '#F2F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 800, color: '#3A4C43' }}>₵</span>
          <input type="number" step="0.01" value={medium} onChange={(e) => setMedium(e.target.value)} style={input} />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ width: '100%', height: 44, marginTop: 18, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(100deg,#0BAE5E,#12C56E)', boxShadow: '0 8px 18px rgba(5,193,106,.28)' }}
      >
        {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 16, padding: '11px 13px', borderRadius: 11, background: '#F1F7FC', border: '1px solid #D6E6F3' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flex: 'none', marginTop: 1 }}>
          <circle cx="12" cy="12" r="9.2" stroke="#3A80C1" strokeWidth="1.9" />
          <path d="M12 11v5.5" stroke="#3A80C1" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="7.8" r="1.2" fill="#3A80C1" />
        </svg>
        <span style={{ fontSize: 11, lineHeight: 1.45, fontWeight: 600, color: '#2F6597' }}>
          New prices apply to reports submitted after this change — past reports keep their original pricing.
        </span>
      </div>
    </div>
  );
}