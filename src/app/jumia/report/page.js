'use client';

import { useEffect, useState } from 'react';
import { Camera, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const mLabel = { display: 'block', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,.82)', marginBottom: 6 };
const mField = { display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 13px', borderRadius: 13, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', boxSizing: 'border-box' };
const stepper = { display: 'flex', alignItems: 'center', gap: 8, height: 46, padding: '0 5px', borderRadius: 13, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', boxSizing: 'border-box' };
const stepBtn = { flex: 'none', width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReportPage() {
  // The rider comes from the signed session cookie (set after the PIN
  // check on their private link) — never from the URL.
  const [rider, setRider] = useState(null);
  const [expired, setExpired] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [small, setSmall] = useState(0);
  const [medium, setMedium] = useState(0);
  const [pricing, setPricing] = useState({ small: 0, medium: 0 });
  const [preview, setPreview] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/jumia/session/me')
      .then(async (res) => {
        if (!res.ok) {
          setExpired(true);
          return;
        }
        setRider(await res.json());
      })
      .catch(() => setExpired(true));
  }, []);

  useEffect(() => {
    if (!rider || !date) return;
    fetch(`/api/jumia/report/submit?date=${date}`)
      .then(async (res) => {
        if (res.status === 401) {
          setExpired(true);
          return;
        }
        const data = await res.json();
        setPricing(data.pricing);
        if (data.existingReport) {
          setSmall(data.existingReport.small_count);
          setMedium(data.existingReport.medium_count);
          setScreenshotUrl(data.existingReport.screenshot_url || '');
          setPreview(data.existingReport.screenshot_url || null);
        } else {
          setSmall(0);
          setMedium(0);
          setScreenshotUrl('');
          setPreview(null);
        }
      });
  }, [rider, date]);

  const total = small * pricing.small + medium * pricing.medium;

  const uploadFile = async (file) => {
    if (!file || !rider) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    // No rider id is sent — /api/upload identifies the rider from the
    // session cookie.
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (res.status === 401) {
      setExpired(true);
    } else if (data.url) {
      setError('');
      setScreenshotUrl(data.url);
    } else {
      setPreview(screenshotUrl || null);
      setError(data.error || 'Could not upload that photo. Please try again.');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    const res = await fetch('/api/jumia/report/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportDate: date, screenshotUrl, small, medium }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
    } else if (res.status === 401) {
      setExpired(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Something went wrong.');
    }
  };

  if (expired) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#0E2A1D 0%,#123522 55%,#173D28 100%)', fontFamily: FONT, color: '#fff', padding: '40px 28px', textAlign: 'center' }}>
        <img src="/logo.png" alt="NTVL" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 18 }} />
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 9 }}>Session expired</h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, lineHeight: 1.5, maxWidth: 300 }}>
          Open your private link again and enter your PIN to continue.
        </p>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 11.5, marginTop: 14, maxWidth: 300 }}>
          Don&apos;t have your link? Ask your admin to send it to you.
        </p>
      </div>
    );
  }

  if (!rider) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#0E2A1D 0%,#123522 55%,#173D28 100%)', color: 'rgba(255,255,255,.6)', fontFamily: FONT }}>
        Loading...
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#0E2A1D 0%,#123522 55%,#173D28 100%)', fontFamily: FONT, color: '#fff', padding: '40px 28px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(5,193,106,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <CheckCircle2 size={38} color="#05C16A" />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 9 }}>Report Submitted</h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}>
          {date} — {small} Small, {medium} Medium — Total ₵{total.toFixed(2)}
        </p>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 11.5 }}>
          You can update this report until it's settled by your shop.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          style={{ marginTop: 24, height: 42, padding: '0 22px', border: 'none', borderRadius: 13, background: '#05C16A', color: '#06281A', fontFamily: FONT, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
        >
          Back to report
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#0E2A1D 0%,#123522 55%,#173D28 100%)', fontFamily: FONT, color: '#fff' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 800, letterSpacing: '-.3px' }}>Daily Report</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '10px 12px', borderRadius: 15, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)' }}>
          <div style={{ flex: 'none', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {initials(rider.name)}
          </div>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 800 }}>{rider.name}</span>
        </div>

        <div style={{ marginTop: 13 }}>
          <label style={mLabel}>Date</label>
          <div style={mField}>
            <input
              type="date"
              value={date}
              max={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#fff', outline: 'none', colorScheme: 'dark' }}
            />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={mLabel}>Delivery Screenshot</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: preview ? 'auto' : 50, padding: preview ? 8 : 0, borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1.5px dashed rgba(255,255,255,.22)' }}>
            {preview ? (
              <img src={preview} alt="" style={{ maxHeight: 120, borderRadius: 8 }} />
            ) : (
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>{uploading ? 'Uploading...' : 'No photo selected'}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 9, marginTop: 8 }}>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 40, borderRadius: 12, background: '#4FE39C', fontSize: 12, fontWeight: 800, color: '#0E2A1D', cursor: 'pointer' }}>
              <Camera size={15} /> Take Photo
              <input type="file" accept="image/*" capture="environment" onChange={(e) => uploadFile(e.target.files[0])} style={{ display: 'none' }} />
            </label>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.18)', fontSize: 11, fontWeight: 800, color: '#fff', cursor: 'pointer', boxSizing: 'border-box' }}>
              <ImageIcon size={15} /> Gallery
              <input type="file" accept="image/*" onChange={(e) => uploadFile(e.target.files[0])} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={mLabel}>Small Packages</label>
          <div style={stepper}>
            <span style={stepBtn} onClick={() => setSmall((s) => Math.max(0, s - 1))}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 12h12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></svg>
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={small}
              onChange={(e) => setSmall(Math.max(0, parseInt(e.target.value) || 0))}
              onFocus={(e) => e.target.select()}
              style={{ flex: 1, minWidth: 0, textAlign: 'center', fontSize: 19, fontWeight: 800, color: '#fff', background: 'transparent', border: 'none', outline: 'none', fontFamily: FONT, WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            />
            <span style={stepBtn} onClick={() => setSmall((s) => s + 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 6v12M6 12h12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></svg>
            </span>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={mLabel}>Medium Packages</label>
          <div style={stepper}>
            <span style={stepBtn} onClick={() => setMedium((s) => Math.max(0, s - 1))}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 12h12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></svg>
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={medium}
              onChange={(e) => setMedium(Math.max(0, parseInt(e.target.value) || 0))}
              onFocus={(e) => e.target.select()}
              style={{ flex: 1, minWidth: 0, textAlign: 'center', fontSize: 19, fontWeight: 800, color: '#fff', background: 'transparent', border: 'none', outline: 'none', fontFamily: FONT, WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            />
            <span style={stepBtn} onClick={() => setMedium((s) => s + 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 6v12M6 12h12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></svg>
            </span>
          </div>
        </div>

        <div style={{ marginTop: 12, padding: '11px 15px', borderRadius: 13, background: 'rgba(5,193,106,.12)', border: '1px solid rgba(79,227,156,.32)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>Total</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: '#4FE39C', marginTop: 1 }}>₵{total.toFixed(2)}</div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.66)', marginTop: 3 }}>
            {small} × ₵{pricing.small} + {medium} × ₵{pricing.medium}
          </div>
        </div>

        {error && <p style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: '#FF8E8E' }}>{error}</p>}
      </div>

      <div style={{ flex: 'none', padding: '12px 20px 26px' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: '100%', height: 50, border: 'none', borderRadius: 15, cursor: 'pointer', fontFamily: FONT, fontSize: 14.5, fontWeight: 800, color: '#fff', background: 'linear-gradient(100deg,#0BAE5E,#12C56E)', boxShadow: '0 10px 22px rgba(5,193,106,.3)' }}
        >
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </div>
  );
}