'use client';

import PhotoUpload from './PhotoUpload';
import LocationPicker from './LocationPicker';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#05C16A';

const input = {
  width: '100%', boxSizing: 'border-box', height: 54, padding: '0 16px',
  borderRadius: 15, fontFamily: FONT, fontSize: 15, fontWeight: 500, color: '#fff',
  background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.13)',
};
const inputErrStyle = { ...input, background: 'rgba(255,107,107,.07)', border: '1px solid rgba(255,107,107,.5)' };

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.8)', marginBottom: 8 };

const primaryBtn = {
  width: '100%', height: 58, border: 'none', borderRadius: 18, cursor: 'pointer',
  fontFamily: FONT, fontSize: 16.5, fontWeight: 700, background: ACCENT, color: '#06281A',
  boxShadow: '0 12px 28px rgba(5,193,106,.3)',
};
const ghostBtn = {
  width: '100%', height: 52, border: '1px solid rgba(255,255,255,.16)', borderRadius: 16, cursor: 'pointer',
  fontFamily: FONT, fontSize: 15, fontWeight: 700, background: 'transparent', color: 'rgba(255,255,255,.85)',
  marginTop: 10,
};

const STEP1_FIELDS = ['fullName', 'phone', 'email', 'address', 'ghanaIdNumber', 'licenseNumber', 'ghanaIdImageUrl', 'licenseImageUrl'];
const STEP2_FIELDS = ['latitude', 'longitude'];
const STEP3_FIELDS = ['guarantorFullName', 'guarantorPhone', 'guarantorEmail', 'guarantorAddress', 'guarantorGhanaIdNumber', 'guarantorGhanaIdImageUrl', 'guarantorLatitude', 'guarantorLongitude'];

function getMissingFields(form, fieldList) {
  return fieldList.filter((f) => {
    const value = form[f];
    return value === '' || value === null || value === undefined;
  });
}

function ProgressHeader({ step, title }) {
  return (
    <div style={{ flex: 'none', padding: '20px 22px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.3px', color: '#4FE39C' }}>Step {step} of 4</span>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} style={{ flex: 1, height: 5, borderRadius: 3, background: n <= step ? ACCENT : 'rgba(255,255,255,.15)' }} />
          ))}
        </div>
      </div>
      <h1 style={{ margin: '14px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: '-.5px' }}>{title}</h1>
    </div>
  );
}

function FieldError() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7 }}>
      <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#FF6B6B', color: '#3B0D0D', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#FF8E8E' }}>This field is required</span>
    </div>
  );
}

export default function RegisterClient({ token }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState([]);
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', address: '', ghanaIdNumber: '', licenseNumber: '',
    ghanaIdImageUrl: '', licenseImageUrl: '', latitude: null, longitude: null,
    guarantorFullName: '', guarantorPhone: '', guarantorEmail: '', guarantorAddress: '',
    guarantorGhanaIdNumber: '', guarantorGhanaIdImageUrl: '', guarantorLatitude: null, guarantorLongitude: null,
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const goToStep = (targetStep, fieldsToCheck) => {
    const missing = getMissingFields(form, fieldsToCheck);
    if (missing.length > 0) {
      setErrors(missing);
      return;
    }
    setErrors([]);
    setStep(targetStep);
  };

  const has = (field) => errors.includes(field);
  const style = (field) => (has(field) ? inputErrStyle : input);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(170deg,#0E2A1D 0%,#173D28 100%)', fontFamily: FONT, color: '#fff' }}>
      {step === 1 && (
        <>
          <ProgressHeader step={1} title="Your Details" />
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 22px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={style('fullName')} value={form.fullName} onChange={update('fullName')} placeholder="e.g. Kwame Mensah" />
              {has('fullName') && <FieldError />}
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input style={style('phone')} value={form.phone} onChange={update('phone')} placeholder="+233 24 000 0000" />
              {has('phone') && <FieldError />}
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input style={style('email')} type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
              {has('email') && <FieldError />}
            </div>
            <div>
              <label style={labelStyle}>Residential Address</label>
              <input style={style('address')} value={form.address} onChange={update('address')} placeholder="House number, area, city" />
              {has('address') && <FieldError />}
            </div>
            <div>
              <label style={labelStyle}>Ghana Card Number</label>
              <input style={style('ghanaIdNumber')} value={form.ghanaIdNumber} onChange={update('ghanaIdNumber')} placeholder="GHA-000000000-0" />
              {has('ghanaIdNumber') && <FieldError />}
            </div>
            <div>
              <label style={labelStyle}>Driving License Number</label>
              <input style={style('licenseNumber')} value={form.licenseNumber} onChange={update('licenseNumber')} placeholder="DVLA-000000" />
              {has('licenseNumber') && <FieldError />}
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,.1)', margin: '2px 0' }} />

            <PhotoUpload token={token} label="Ghana Card Photo" error={has('ghanaIdImageUrl')} onUploaded={(url) => setForm((f) => ({ ...f, ghanaIdImageUrl: url }))} />
            <PhotoUpload token={token} label="Driving License Photo" error={has('licenseImageUrl')} onUploaded={(url) => setForm((f) => ({ ...f, licenseImageUrl: url }))} />
          </div>
          <div style={{ flex: 'none', padding: '12px 22px 30px', background: 'linear-gradient(to top,#173D28 62%,rgba(23,61,40,0))' }}>
            <button style={primaryBtn} onClick={() => goToStep(2, STEP1_FIELDS)}>Next: Your Location</button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <ProgressHeader step={2} title="Your Location" />
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 22px 20px' }}>
            <LocationPicker
              lat={form.latitude}
              lng={form.longitude}
              onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
            />
            {has('latitude') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#FF6B6B', color: '#3B0D0D', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#FF8E8E' }}>Please drop a pin on your location before continuing</span>
              </div>
            )}
          </div>
          <div style={{ flex: 'none', padding: '12px 22px 30px', background: 'linear-gradient(to top,#173D28 62%,rgba(23,61,40,0))' }}>
            <button style={primaryBtn} onClick={() => goToStep(3, STEP2_FIELDS)}>Next: Guarantor Details</button>
            <button style={ghostBtn} onClick={() => { setErrors([]); setStep(1); }}>Back</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <ProgressHeader step={3} title="Guarantor Details" />
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 22px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Guarantor Full Name</label>
              <input style={style('guarantorFullName')} value={form.guarantorFullName} onChange={update('guarantorFullName')} placeholder="e.g. Abena Owusu" />
              {has('guarantorFullName') && <FieldError />}
            </div>
            <div>
              <label style={labelStyle}>Guarantor Phone Number</label>
              <input style={style('guarantorPhone')} value={form.guarantorPhone} onChange={update('guarantorPhone')} placeholder="+233 20 000 0000" />
              {has('guarantorPhone') && <FieldError />}
            </div>
            <div>
              <label style={labelStyle}>Guarantor Email Address</label>
              <input style={style('guarantorEmail')} type="email" value={form.guarantorEmail} onChange={update('guarantorEmail')} placeholder="guarantor@example.com" />
              {has('guarantorEmail') && <FieldError />}
            </div>
            <div>
              <label style={labelStyle}>Guarantor Residential Address</label>
              <input style={style('guarantorAddress')} value={form.guarantorAddress} onChange={update('guarantorAddress')} placeholder="House number, area, city" />
              {has('guarantorAddress') && <FieldError />}
            </div>
            <div>
              <label style={labelStyle}>Guarantor Ghana Card Number</label>
              <input style={style('guarantorGhanaIdNumber')} value={form.guarantorGhanaIdNumber} onChange={update('guarantorGhanaIdNumber')} placeholder="GHA-000000000-0" />
              {has('guarantorGhanaIdNumber') && <FieldError />}
            </div>

            <PhotoUpload token={token} label="Guarantor Ghana Card Photo" error={has('guarantorGhanaIdImageUrl')} onUploaded={(url) => setForm((f) => ({ ...f, guarantorGhanaIdImageUrl: url }))} />

            <div style={{ height: 1, background: 'rgba(255,255,255,.1)', margin: '2px 0' }} />

            <div>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Guarantor's Location</span>
              <div style={{ marginTop: 10 }}>
                <LocationPicker
                  lat={form.guarantorLatitude}
                  lng={form.guarantorLongitude}
                  onChange={(lat, lng) => setForm((f) => ({ ...f, guarantorLatitude: lat, guarantorLongitude: lng }))}
                />
              </div>
              {(has('guarantorLatitude') || has('guarantorLongitude')) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#FF6B6B', color: '#3B0D0D', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#FF8E8E' }}>Please drop a pin on the guarantor's location before continuing</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ flex: 'none', padding: '12px 22px 30px', background: 'linear-gradient(to top,#173D28 62%,rgba(23,61,40,0))' }}>
            <button style={primaryBtn} onClick={() => goToStep(4, STEP3_FIELDS)}>Next: Review & Submit</button>
            <button style={ghostBtn} onClick={() => { setErrors([]); setStep(2); }}>Back</button>
          </div>
        </>
      )}

      {step === 4 && (
        <Step4Review token={token} form={form} onBack={() => { setErrors([]); setStep(3); }} />
      )}
    </div>
  );
}

function Step4Review({ token, form, onBack }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const res = await fetch(`/api/riders/${token}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || 'Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(5,193,106,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <CheckCircle2 size={44} color={ACCENT} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Application Received</h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14.5, lineHeight: 1.5 }}>
          Thank you. NTVS will review your application and get back to you by email within 2–3 business days.
        </p>
      </div>
    );
  }

  const row = (label, value) => (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(180,220,198,.62)' }}>{label}</span>
      <span style={{ fontSize: 14.5, fontWeight: 600, color: '#fff', textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );

  const coord = (lat, lng) => (
    <span style={{ font: "500 12.5px 'JetBrains Mono',ui-monospace,Menlo,monospace" }}>
      {lat.toFixed(4)}, {lng.toFixed(4)}
    </span>
  );

  return (
    <>
      <ProgressHeader step={4} title="Review & Submit" />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 22px 20px' }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.3px', color: '#4FE39C', textTransform: 'uppercase' }}>Your Details</span>
        {row('Full Name', form.fullName)}
        {row('Phone', form.phone)}
        {row('Email', form.email)}
        {row('Address', form.address)}
        {row('Ghana Card', form.ghanaIdNumber)}
        {row('License', form.licenseNumber)}
        {row('Location', form.latitude ? coord(form.latitude, form.longitude) : null)}

        <div style={{ marginTop: 22 }}>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.3px', color: '#4FE39C', textTransform: 'uppercase' }}>Guarantor</span>
          {row('Full Name', form.guarantorFullName)}
          {row('Phone', form.guarantorPhone)}
          {row('Email', form.guarantorEmail)}
          {row('Address', form.guarantorAddress)}
          {row('Ghana Card', form.guarantorGhanaIdNumber)}
          {row('Location', form.guarantorLatitude ? coord(form.guarantorLatitude, form.guarantorLongitude) : null)}
        </div>

        {error && <p style={{ color: '#FF8E8E', marginTop: 16, fontSize: 14 }}>{error}</p>}
      </div>
      <div style={{ flex: 'none', padding: '12px 22px 30px', background: 'linear-gradient(to top,#173D28 62%,rgba(23,61,40,0))' }}>
        <button style={{ ...primaryBtn, opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
        <button style={ghostBtn} onClick={onBack} disabled={submitting}>Back</button>
      </div>
    </>
  );
}