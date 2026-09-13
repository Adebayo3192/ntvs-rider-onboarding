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
  marginBottom: 4,
  boxSizing: 'border-box',
};

const inputErrorStyle = { ...inputStyle, border: '1px solid #F5A3A3' };

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#B7D4C4',
  marginBottom: 6,
  display: 'block',
};

const errorTextStyle = {
  color: '#F5A3A3',
  fontSize: 12,
  marginBottom: 10,
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

const STEP1_FIELDS = ['fullName', 'phone', 'email', 'address', 'ghanaIdNumber', 'licenseNumber', 'ghanaIdImageUrl', 'licenseImageUrl'];
const STEP2_FIELDS = ['latitude', 'longitude'];
const STEP3_FIELDS = ['guarantorFullName', 'guarantorPhone', 'guarantorEmail', 'guarantorAddress', 'guarantorGhanaIdNumber', 'guarantorGhanaIdImageUrl', 'guarantorLatitude', 'guarantorLongitude'];

function getMissingFields(form, fieldList) {
  return fieldList.filter((f) => {
    const value = form[f];
    return value === '' || value === null || value === undefined;
  });
}

export default function RegisterClient({ token }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState([]);
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
  const style = (field) => (has(field) ? inputErrorStyle : inputStyle);

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
            <input style={style('fullName')} value={form.fullName} onChange={update('fullName')} placeholder="e.g. Kwame Mensah" />
            {has('fullName') && <span style={errorTextStyle}>This field is required</span>}

            <label style={labelStyle}>Phone Number</label>
            <input style={style('phone')} value={form.phone} onChange={update('phone')} placeholder="+233 24 000 0000" />
            {has('phone') && <span style={errorTextStyle}>This field is required</span>}

            <label style={labelStyle}>Email Address</label>
            <input style={style('email')} type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
            {has('email') && <span style={errorTextStyle}>This field is required</span>}

            <label style={labelStyle}>Residential Address</label>
            <input style={style('address')} value={form.address} onChange={update('address')} placeholder="House number, area, city" />
            {has('address') && <span style={errorTextStyle}>This field is required</span>}

            <label style={labelStyle}>Ghana Card Number</label>
            <input style={style('ghanaIdNumber')} value={form.ghanaIdNumber} onChange={update('ghanaIdNumber')} placeholder="GHA-000000000-0" />
            {has('ghanaIdNumber') && <span style={errorTextStyle}>This field is required</span>}

            <label style={labelStyle}>Driving License Number</label>
            <input style={style('licenseNumber')} value={form.licenseNumber} onChange={update('licenseNumber')} placeholder="DVLA-000000" />
            {has('licenseNumber') && <span style={errorTextStyle}>This field is required</span>}

            <div style={{ marginTop: 10 }}>
              <PhotoUpload
                token={token}
                label="Ghana Card Photo"
                onUploaded={(url) => setForm((f) => ({ ...f, ghanaIdImageUrl: url }))}
              />
              {has('ghanaIdImageUrl') && <span style={{ ...errorTextStyle, marginTop: -8 }}>Please upload this photo</span>}

              <PhotoUpload
                token={token}
                label="Driving License Photo"
                onUploaded={(url) => setForm((f) => ({ ...f, licenseImageUrl: url }))}
              />
              {has('licenseImageUrl') && <span style={{ ...errorTextStyle, marginTop: -8 }}>Please upload this photo</span>}
            </div>

            <button onClick={() => goToStep(2, STEP1_FIELDS)} style={buttonStyle}>
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
            {has('latitude') && <span style={errorTextStyle}>Please drop a pin on your location before continuing</span>}

            <button onClick={() => goToStep(3, STEP2_FIELDS)} style={buttonStyle}>
              Next: Guarantor Details
            </button>
            <button onClick={() => { setErrors([]); setStep(1); }} style={{ ...buttonStyle, background: 'transparent', border: '1px solid #2A4A38', marginTop: 10 }}>
              Back
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Guarantor Details</h1>

            <label style={labelStyle}>Guarantor Full Name</label>
            <input style={style('guarantorFullName')} value={form.guarantorFullName} onChange={update('guarantorFullName')} placeholder="e.g. Abena Owusu" />
            {has('guarantorFullName') && <span style={errorTextStyle}>This field is required</span>}

            <label style={labelStyle}>Guarantor Phone Number</label>
            <input style={style('guarantorPhone')} value={form.guarantorPhone} onChange={update('guarantorPhone')} placeholder="+233 20 000 0000" />
            {has('guarantorPhone') && <span style={errorTextStyle}>This field is required</span>}

            <label style={labelStyle}>Guarantor Email Address</label>
            <input style={style('guarantorEmail')} type="email" value={form.guarantorEmail} onChange={update('guarantorEmail')} placeholder="guarantor@example.com" />
            {has('guarantorEmail') && <span style={errorTextStyle}>This field is required</span>}

            <label style={labelStyle}>Guarantor Residential Address</label>
            <input style={style('guarantorAddress')} value={form.guarantorAddress} onChange={update('guarantorAddress')} placeholder="House number, area, city" />
            {has('guarantorAddress') && <span style={errorTextStyle}>This field is required</span>}

            <label style={labelStyle}>Guarantor Ghana Card Number</label>
            <input style={style('guarantorGhanaIdNumber')} value={form.guarantorGhanaIdNumber} onChange={update('guarantorGhanaIdNumber')} placeholder="GHA-000000000-0" />
            {has('guarantorGhanaIdNumber') && <span style={errorTextStyle}>This field is required</span>}

            <div style={{ marginTop: 10 }}>
              <PhotoUpload
                token={token}
                label="Guarantor Ghana Card Photo"
                onUploaded={(url) => setForm((f) => ({ ...f, guarantorGhanaIdImageUrl: url }))}
              />
              {has('guarantorGhanaIdImageUrl') && <span style={{ ...errorTextStyle, marginTop: -8 }}>Please upload this photo</span>}
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 10 }}>Guarantor's Location</h2>
            <LocationPicker
              lat={form.guarantorLatitude}
              lng={form.guarantorLongitude}
              onChange={(lat, lng) => setForm((f) => ({ ...f, guarantorLatitude: lat, guarantorLongitude: lng }))}
            />
            {(has('guarantorLatitude') || has('guarantorLongitude')) && (
              <span style={errorTextStyle}>Please drop a pin on the guarantor's location before continuing</span>
            )}

            <button onClick={() => goToStep(4, STEP3_FIELDS)} style={buttonStyle}>
              Next: Review & Submit
            </button>
            <button onClick={() => { setErrors([]); setStep(2); }} style={{ ...buttonStyle, background: 'transparent', border: '1px solid #2A4A38', marginTop: 10 }}>
              Back
            </button>
          </>
        )}

        {step === 4 && (
          <Step4Review
            token={token}
            form={form}
            onBack={() => { setErrors([]); setStep(3); }}
          />
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