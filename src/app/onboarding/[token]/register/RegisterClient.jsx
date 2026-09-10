'use client';

import PhotoUpload from './PhotoUpload';
import { useState } from 'react';
import LocationPicker from './LocationPicker';

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

            <button onClick={() => setStep(1)} style={{ ...buttonStyle, background: 'transparent', border: '1px solid #2A4A38', marginBottom: 10 }}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}