'use client';

import PhotoUpload from './PhotoUpload';
import { useState } from 'react';
import LocationPicker from './LocationPicker';
import { CheckCircle2 } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: 12,
  border: '1px solid #2A4A38',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontSize: 15,
  marginBottom: 14,
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#B7D4C4',
  marginBottom: 6,
  display: 'block',
};

const buttonStyle = {
  width: '100%',
  padding: '16px',
  borderRadius: 14,
  border: 'none',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  background: '#05C16A',
  color: '#fff',
  marginTop: 8,
};

export default function RegisterClient({ token }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    ghanaIdNumber: '',
    licenseNumber: '',
    ghanaIdImageUrl: '',
    licenseImageUrl: '',
    latitude: null,
    longitude: null,
    guarantorFullName: '',
    guarantorPhone: '',
    guarantorEmail: '',
    guarantorAddress: '',
    guarantorGhanaIdNumber: '',
    guarantorGhanaIdImageUrl: '',
    guarantorLatitude: null,
    guarantorLongitude: null,
  });

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0E2A1D, #173D28)', color: '#fff', padding: '32px 20px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#7FB89E', marginBottom: 8 }}>
          Step {step} of 4
        </div>

        {step === 1 && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Your Details</h1>

            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={form.fullName} onChange={update('fullName')} placeholder="e.g. Kwame Mensah" />

            <label style={labelStyle}>Phone Number</label>
            <input style={inputStyle} value={form.phone} onChange={update('phone')} placeholder="+233 24 000 0000" />

            <label style={labelStyle}>Email Address</label>
            <input style={inputStyle} type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />

            <label style={labelStyle}>Residential Address</label>
            <input style={inputStyle} value={form.address} onChange={update('address')} placeholder="House number, area, city" />

            <label style={labelStyle}>Ghana Card Number</label>
            <input style={inputStyle} value={form.ghanaIdNumber} onChange={update('ghanaIdNumber')} placeholder="GHA-000000000-0" />

            <label style={labelStyle}>Driving License Number</label>
            <input style={inputStyle} value={form.licenseNumber} onChange={update('licenseNumber')} placeholder="DVLA-000000" />

            <PhotoUpload
              token={token}
              label="Ghana Card Photo"
              onUploaded={(url) => setForm((f) => ({ ...f, ghanaIdImageUrl: url }))}
            />

            <PhotoUpload
              token={token}
              label="Driving License Photo"
              onUploaded={(url) => setForm((f) => ({ ...f, licenseImageUrl: url }))}
            />

            <button onClick={() => setStep(2)} style={buttonStyle}>
              Next: Your Location
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Your Location</h1>

            <LocationPicker
              lat={form.latitude}
              lng={form.longitude}
              onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
            />

            <button onClick={() => setStep(3)} style={buttonStyle}>
              Next: Guarantor Details
            </button>
            <button onClick={() => setStep(1)} style={{ ...buttonStyle, background: 'transparent', border: '1px solid #2A4A38', marginTop: 10 }}>
              Back
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Guarantor Details</h1>

            <label style={labelStyle}>Guarantor Full Name</label>
            <input style={inputStyle} value={form.guarantorFullName} onChange={update('guarantorFullName')} placeholder="e.g. Abena Owusu" />

            <label style={labelStyle}>Guarantor Phone Number</label>
            <input style={inputStyle} value={form.guarantorPhone} onChange={update('guarantorPhone')} placeholder="+233 20 000 0000" />

            <label style={labelStyle}>Guarantor Email Address</label>
            <input style={inputStyle} type="email" value={form.guarantorEmail} onChange={update('guarantorEmail')} placeholder="guarantor@example.com" />

            <label style={labelStyle}>Guarantor Residential Address</label>
            <input style={inputStyle} value={form.guarantorAddress} onChange={update('guarantorAddress')} placeholder="House number, area, city" />

            <label style={labelStyle}>Guarantor Ghana Card Number</label>
            <input style={inputStyle} value={form.guarantorGhanaIdNumber} onChange={update('guarantorGhanaIdNumber')} placeholder="GHA-000000000-0" />

            <PhotoUpload
              token={token}
              label="Guarantor Ghana Card Photo"
              onUploaded={(url) => setForm((f) => ({ ...f, guarantorGhanaIdImageUrl: url }))}
            />

            <h2 style={{ fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 10 }}>Guarantor's Location</h2>
            <LocationPicker
              lat={form.guarantorLatitude}
              lng={form.guarantorLongitude}
              onChange={(lat, lng) => setForm((f) => ({ ...f, guarantorLatitude: lat, guarantorLongitude: lng }))}
            />

            <button onClick={() => setStep(4)} style={buttonStyle}>
              Next: Review & Submit
            </button>
            <button onClick={() => setStep(2)} style={{ ...buttonStyle, background: 'transparent', border: '1px solid #2A4A38', marginTop: 10 }}>
              Back
            </button>
          </>
        )}

        {step === 4 && (
          <Step4Review token={token} form={form} onBack={() => setStep(3)} />
        )}
      </div>
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
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <CheckCircle2 size={48} color="#05C16A" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Application Received</h1>
        <p style={{ color: '#B7D4C4', fontSize: 15 }}>
          Thank you. NTVS will review your application and get back to you by email within 2–3 business days.
        </p>
      </div>
    );
  }

  const row = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2A4A38' }}>
      <span style={{ color: '#7FB89E', fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 14, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
    </div>
  );

  return (
    <>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Review & Submit</h1>

      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#05C16A' }}>Your Details</h2>
      {row('Full Name', form.fullName)}
      {row('Phone', form.phone)}
      {row('Email', form.email)}
      {row('Address', form.address)}
      {row('Ghana Card', form.ghanaIdNumber)}
      {row('License', form.licenseNumber)}
      {row('Location', form.latitude ? `${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}` : null)}

      <h2 style={{ fontSize: 15, fontWeight: 700, marginTop: 20, marginBottom: 8, color: '#05C16A' }}>Guarantor</h2>
      {row('Full Name', form.guarantorFullName)}
      {row('Phone', form.guarantorPhone)}
      {row('Email', form.guarantorEmail)}
      {row('Address', form.guarantorAddress)}
      {row('Ghana Card', form.guarantorGhanaIdNumber)}
      {row('Location', form.guarantorLatitude ? `${form.guarantorLatitude.toFixed(4)}, ${form.guarantorLongitude.toFixed(4)}` : null)}

      {error && <p style={{ color: '#F5A3A3', marginTop: 16, fontSize: 14 }}>{error}</p>}

      <button onClick={handleSubmit} disabled={submitting} style={{ ...buttonStyle, marginTop: 24 }}>
        {submitting ? 'Submitting...' : 'Submit Application'}
      </button>
      <button onClick={onBack} style={{ ...buttonStyle, background: 'transparent', border: '1px solid #2A4A38', marginTop: 10 }}>
        Back
      </button>
    </>
  );
}