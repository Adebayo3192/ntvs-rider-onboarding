'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const pinBoxBase = { flex: 1, height: 52, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', boxSizing: 'border-box' };
const pinFilled = { ...pinBoxBase, background: 'rgba(5,193,106,.18)', border: '2px solid #05C16A' };
const pinEmpty = { ...pinBoxBase, background: 'rgba(255,255,255,.07)', border: '2px solid rgba(255,255,255,.18)' };

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function PinDots({ value }) {
  return (
    <div style={{ display: 'flex', gap: 11 }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={i < value.length ? pinFilled : pinEmpty}>{i < value.length ? '•' : ''}</span>
      ))}
    </div>
  );
}

export default function PinClient({ token, riderName, hasPin, locked }) {
  const router = useRouter();
  const inputRef = useRef(null);

  const [mode, setMode] = useState(hasPin ? 'verify' : 'create'); // 'create' | 'verify'
  const [stage, setStage] = useState('pin'); // for create mode: 'pin' then 'confirm'
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLocked, setIsLocked] = useState(locked);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const confirming = mode === 'create' && stage === 'confirm';
  const current = confirming ? confirmPin : pin;

  const reset = () => {
    setPin('');
    setConfirmPin('');
    setStage('pin');
  };

  const submit = async (action, value) => {
    setSubmitting(true);
    let res;
    try {
      res = await fetch('/api/jumia/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, pin: value, action }),
      });
    } catch {
      setSubmitting(false);
      reset();
      setError('Network problem. Please try again.');
      return;
    }

    if (res.ok) {
      router.replace('/jumia/report');
      return;
    }

    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    reset();

    if (res.status === 423) {
      setIsLocked(true);
    } else if (res.status === 401) {
      setError('Incorrect PIN. Please try again.');
    } else if (data.code === 'pin_exists') {
      // A PIN was set since this page loaded (e.g. on another phone).
      setMode('verify');
      setError('A PIN is already set for this link. Enter it to continue.');
    } else if (data.code === 'no_pin') {
      // The admin reset the PIN since this page loaded.
      setMode('create');
      setError('Your PIN was reset. Create a new one to continue.');
    } else {
      setError(data.error || 'Something went wrong. Please try again.');
    }
  };

  const handleChange = (e) => {
    if (submitting || isLocked) return;
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setError('');

    if (confirming) {
      setConfirmPin(value);
      if (value.length < 4) return;
      if (value !== pin) {
        reset();
        setError("PINs don't match. Please try again.");
        return;
      }
      submit('create', value);
      return;
    }

    setPin(value);
    if (value.length < 4) return;
    if (mode === 'verify') submit('verify', value);
    else setStage('confirm');
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#0E2A1D 0%,#123522 55%,#173D28 100%)', fontFamily: FONT, color: '#fff', padding: '20px 22px 30px', boxSizing: 'border-box' }}
    >
      {!isLocked && (
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          aria-label="4-digit PIN"
          value={current}
          onChange={handleChange}
          style={{ position: 'absolute', opacity: 0, height: 1, width: 1, fontSize: 16, border: 'none', padding: 0 }}
        />
      )}

      <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12 }}>
        <img src="/logo.png" alt="NTVL" style={{ width: 72, height: 72, objectFit: 'contain', filter: 'drop-shadow(0 12px 26px rgba(0,0,0,.4))' }} />
      </div>

      <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 15, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)' }}>
        <div style={{ flex: 'none', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {initials(riderName)}
        </div>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 800 }}>{riderName}</span>
      </div>

      {isLocked ? (
        <>
          <h1 style={{ margin: '22px 0 0', fontSize: 20, fontWeight: 800, letterSpacing: '-.5px', textAlign: 'center' }}>PIN locked</h1>
          <p style={{ margin: '7px 0 0', fontSize: 12.5, lineHeight: 1.5, fontWeight: 600, color: 'rgba(255,255,255,.7)', textAlign: 'center' }}>
            This PIN has been locked after too many incorrect attempts. Contact your admin to reset it.
          </p>
        </>
      ) : mode === 'create' ? (
        <>
          <h1 style={{ margin: '22px 0 0', fontSize: 20, fontWeight: 800, letterSpacing: '-.5px', textAlign: 'center' }}>
            {stage === 'pin' ? 'Create your 4-digit PIN' : 'Confirm your 4-digit PIN'}
          </h1>
          <p style={{ margin: '7px 0 0', fontSize: 12, lineHeight: 1.45, fontWeight: 600, color: 'rgba(255,255,255,.66)', textAlign: 'center' }}>
            {stage === 'pin' ? 'This PIN will be used to submit your delivery reports.' : 'Type it again to confirm.'}
          </p>
          <div style={{ marginTop: 20 }}>
            <PinDots value={current} />
          </div>
        </>
      ) : (
        <>
          <h1 style={{ margin: '22px 0 0', fontSize: 20, fontWeight: 800, letterSpacing: '-.5px', textAlign: 'center' }}>Enter your PIN</h1>
          <div style={{ marginTop: 20 }}>
            <PinDots value={current} />
          </div>
        </>
      )}

      {error && !isLocked && (
        <p style={{ marginTop: 14, textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: '#FF8E8E' }}>{error}</p>
      )}

      {submitting && <p style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Please wait...</p>}

      <div style={{ flex: 1, minHeight: 16 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 13px', borderRadius: 12, background: 'rgba(245,194,66,.1)', border: '1px solid rgba(245,194,66,.3)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flex: 'none', marginTop: 1 }}>
          <circle cx="12" cy="12" r="9.2" stroke="#F5C242" strokeWidth="1.9" />
          <path d="M12 11v5.5" stroke="#F5C242" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="7.8" r="1.2" fill="#F5C242" />
        </svg>
        <span style={{ fontSize: 11, lineHeight: 1.4, fontWeight: 600, color: 'rgba(255,255,255,.8)' }}>
          This link is private to you — don&apos;t share it. Contact your admin to reset your PIN.
        </span>
      </div>
    </div>
  );
}
