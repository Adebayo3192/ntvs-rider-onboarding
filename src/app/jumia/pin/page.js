'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

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

function PinContent() {
  const params = useSearchParams();
  const riderId = params.get('rider');
  const router = useRouter();
  const inputRef = useRef(null);

  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null); // 'create' | 'verify'
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [stage, setStage] = useState('pin'); // for create mode: 'pin' then 'confirm'
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!riderId) return;
    fetch('/api/jumia/riders')
      .then((res) => res.json())
      .then((riders) => {
        const found = riders.find((r) => r.id === riderId);
        if (found) {
          setRider(found);
          setMode(found.hasPin ? 'verify' : 'create');
        }
        setLoading(false);
      });
  }, [riderId]);

  const handleDigit = (digit) => {
    setError('');
    if (mode === 'verify' || (mode === 'create' && stage === 'pin')) {
      if (pin.length < 4) setPin(pin + digit);
    } else {
      if (confirmPin.length < 4) setConfirmPin(confirmPin + digit);
    }
  };

  const handleBackspace = () => {
    setError('');
    if (mode === 'verify' || (mode === 'create' && stage === 'pin')) {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  useEffect(() => {
    if (mode === 'verify' && pin.length === 4) {
      handleVerify();
    }
    if (mode === 'create' && stage === 'pin' && pin.length === 4) {
      setStage('confirm');
    }
    if (mode === 'create' && stage === 'confirm' && confirmPin.length === 4) {
      handleCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, confirmPin]);

  const handleVerify = async () => {
    setSubmitting(true);
    const res = await fetch('/api/jumia/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riderId, pin, action: 'verify' }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push(`/jumia/report?rider=${riderId}`);
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleCreate = async () => {
    if (pin !== confirmPin) {
      setError("PINs don't match. Please try again.");
      setPin('');
      setConfirmPin('');
      setStage('pin');
      return;
    }
    setSubmitting(true);
    const res = await fetch('/api/jumia/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riderId, pin, action: 'create' }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push(`/jumia/report?rider=${riderId}`);
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  if (loading || !rider) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#0E2A1D 0%,#123522 55%,#173D28 100%)', color: 'rgba(255,255,255,.6)', fontFamily: FONT }}>
        Loading...
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#0E2A1D 0%,#123522 55%,#173D28 100%)', fontFamily: FONT, color: '#fff', padding: '20px 22px 30px' }}
    >
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        autoFocus
        value=""
        onChange={() => {}}
        onKeyDown={(e) => {
          if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
          if (e.key === 'Backspace') handleBackspace();
        }}
        style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
      />

      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={() => router.push('/jumia')} style={{ flex: 'none', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H6M11.5 6.5L5 12l6.5 5.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 15, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)' }}>
        <div style={{ flex: 'none', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {initials(rider.name)}
        </div>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 800 }}>{rider.name}</span>
        <span onClick={() => router.push('/jumia')} style={{ flex: 'none', fontSize: 11, fontWeight: 800, color: '#4FE39C', textDecoration: 'underline', cursor: 'pointer' }}>
          Not you? Go back
        </span>
      </div>

      {mode === 'create' ? (
        <>
          <h1 style={{ margin: '22px 0 0', fontSize: 20, fontWeight: 800, letterSpacing: '-.5px', textAlign: 'center' }}>
            {stage === 'pin' ? 'Create your 4-digit PIN' : 'Confirm your 4-digit PIN'}
          </h1>
          <p style={{ margin: '7px 0 0', fontSize: 12, lineHeight: 1.45, fontWeight: 600, color: 'rgba(255,255,255,.66)', textAlign: 'center' }}>
            {stage === 'pin' ? 'This PIN will be used to submit your delivery reports.' : 'Type it again to confirm.'}
          </p>
          <div style={{ marginTop: 20 }} onClick={() => inputRef.current?.focus()}>
            <PinDots value={stage === 'pin' ? pin : confirmPin} />
          </div>
        </>
      ) : (
        <>
          <h1 style={{ margin: '22px 0 0', fontSize: 20, fontWeight: 800, letterSpacing: '-.5px', textAlign: 'center' }}>Enter your PIN</h1>
          <div style={{ marginTop: 20 }} onClick={() => inputRef.current?.focus()}>
            <PinDots value={pin} />
          </div>
        </>
      )}

      {error && (
        <p style={{ marginTop: 14, textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: '#FF8E8E' }}>{error}</p>
      )}

      <div style={{ flex: 1, minHeight: 16 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 13px', borderRadius: 12, background: 'rgba(245,194,66,.1)', border: '1px solid rgba(245,194,66,.3)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flex: 'none', marginTop: 1 }}>
          <circle cx="12" cy="12" r="9.2" stroke="#F5C242" strokeWidth="1.9" />
          <path d="M12 11v5.5" stroke="#F5C242" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="7.8" r="1.2" fill="#F5C242" />
        </svg>
        <span style={{ fontSize: 11, lineHeight: 1.4, fontWeight: 600, color: 'rgba(255,255,255,.8)' }}>
          Please contact your admin to reset your PIN.
        </span>
      </div>

      {submitting && <p style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Please wait...</p>}
    </div>
  );
}

export default function PinPage() {
  return (
    <Suspense fallback={null}>
      <PinContent />
    </Suspense>
  );
}