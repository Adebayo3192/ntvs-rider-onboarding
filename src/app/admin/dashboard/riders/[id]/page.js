'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Archive, ArchiveRestore, Trash2, X, CheckCircle2 } from 'lucide-react';

const statusColors = { pending: '#F5C242', approved: '#05C16A', rejected: '#F5A3A3' };

const section = { background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, marginBottom: 20 };
const row = (label, value) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2A4A38' }}>
    <span style={{ color: '#7FB89E', fontSize: 13 }}>{label}</span>
    <span style={{ fontSize: 14 }}>{value || '—'}</span>
  </div>
);

const editInputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #2A4A38',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontSize: 14,
  marginBottom: 10,
  boxSizing: 'border-box',
};

const editLabelStyle = { fontSize: 12, fontWeight: 600, color: '#7FB89E', marginBottom: 4, display: 'block' };

const REJECTION_REASONS = [
  'Incomplete or unclear ID/license photo',
  'Information could not be verified',
  'Guarantor information incomplete or invalid',
  'Ghana Card number invalid or expired',
  'Driving license invalid or expired',
  'Other',
];

function RejectDialog({ onCancel, onConfirm, submitting }) {
  const [selected, setSelected] = useState('');
  const [customReason, setCustomReason] = useState('');

  const finalReason = selected === 'Other' ? customReason.trim() : selected;
  const canSubmit = finalReason.length > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 2000 }}>
      <div style={{ background: '#173D28', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, maxHeight: '85vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#fff' }}>Reason for Rejection</h2>

        {REJECTION_REASONS.map((reason) => (
          <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', color: '#DCEFE3', fontSize: 14, cursor: 'pointer' }}>
            <input
              type="radio"
              name="rejectionReason"
              value={reason}
              checked={selected === reason}
              onChange={(e) => setSelected(e.target.value)}
            />
            {reason}
          </label>
        ))}

        {selected === 'Other' && (
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Type the reason..."
            style={{ width: '100%', minHeight: 80, marginTop: 10, padding: 12, borderRadius: 10, border: '1px solid #2A4A38', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, boxSizing: 'border-box' }}
          />
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: 14, borderRadius: 12, border: '1px solid #2A4A38', background: 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(finalReason)}
            disabled={!canSubmit || submitting}
            style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: canSubmit ? '#F5A3A3' : '#4a4a4a', color: '#0E2A1D', fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
          >
            {submitting ? 'Rejecting...' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageLightbox({ src, alt, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 3000,
        cursor: 'zoom-out',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
        }}
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 12, objectFit: 'contain', cursor: 'default' }}
      />
    </div>
  );
}

function SuccessToast({ message }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#173D28',
        border: '1px solid #05C16A',
        borderRadius: 12,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
        zIndex: 4000,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <CheckCircle2 size={18} color="#05C16A" />
      {message}
    </div>
  );
}

export default function RiderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [acting, setActing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const load = async () => {
    const res = await fetch(`/api/admin/riders/${id}`);
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    load();
  }, [id]);

  const startEditing = () => {
    setEditForm({
      fullName: data.rider.full_name || '',
      phone: data.rider.phone || '',
      email: data.rider.email || '',
      address: data.rider.address || '',
      ghanaIdNumber: data.rider.ghana_id_number || '',
      licenseNumber: data.rider.license_number || '',
      guarantor: data.guarantor
        ? {
            fullName: data.guarantor.full_name || '',
            phone: data.guarantor.phone || '',
            email: data.guarantor.email || '',
            address: data.guarantor.address || '',
            ghanaIdNumber: data.guarantor.ghana_id_number || '',
          }
        : null,
    });
    setEditing(true);
  };

  const updateField = (field) => (e) => {
    setEditForm({ ...editForm, [field]: e.target.value });
  };

  const updateGuarantorField = (field) => (e) => {
    setEditForm({ ...editForm, guarantor: { ...editForm.guarantor, [field]: e.target.value } });
  };

  const goBackWithMessage = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      router.push('/admin/dashboard/riders');
    }, 1200);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/riders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setSaving(false);
    setEditing(false);
    load();
    goBackWithMessage('Rider details updated');
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this rider?')) return;
    setActing(true);
    await fetch(`/api/admin/riders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    setActing(false);
    goBackWithMessage('Rider approved');
  };

  const handleReject = async (reason) => {
    setActing(true);
    await fetch(`/api/admin/riders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', reason }),
    });
    setActing(false);
    setShowRejectDialog(false);
    goBackWithMessage('Rider rejected');
  };

  const handleArchiveToggle = async () => {
    const nextArchived = !data.rider.archived;
    const label = nextArchived ? 'archive' : 'unarchive';
    if (!confirm(`Are you sure you want to ${label} this rider?`)) return;

    setActing(true);
    await fetch(`/api/admin/riders/${id}/archive`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: nextArchived }),
    });
    setActing(false);
    goBackWithMessage(nextArchived ? 'Rider archived' : 'Rider unarchived');
  };

  const handleDelete = async () => {
    if (!confirm('This will permanently delete this rider and their guarantor. This cannot be undone. Are you sure?')) return;

    setActing(true);
    await fetch(`/api/admin/riders/${id}`, { method: 'DELETE' });
    goBackWithMessage('Rider deleted');
  };

  if (!data) {
    return <div style={{ minHeight: '100vh', background: '#0E2A1D', color: '#7FB89E', padding: 32 }}>Loading...</div>;
  }

  const { rider, guarantor } = data;
  const mapsLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

  const thumbStyle = { width: 100, height: 100, objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0E2A1D, #173D28)', color: '#fff', padding: '32px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/admin/dashboard/riders" style={{ color: '#7FB89E', fontSize: 14, textDecoration: 'none' }}>
          ← Back to Riders
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 8px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>{rider.full_name || 'Rider'}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: statusColors[rider.status], color: '#0E2A1D', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 999 }}>
              {rider.status}
            </span>
            {rider.archived && (
              <span style={{ background: '#4a4a4a', color: '#DCEFE3', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 999 }}>
                Archived
              </span>
            )}
            {!editing && rider.status === 'pending' && (
              <button
                onClick={startEditing}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #2A4A38', background: 'transparent', color: '#DCEFE3', fontSize: 13, cursor: 'pointer' }}
              >
                <Pencil size={14} /> Edit
              </button>
            )}
          </div>
        </div>

        {!editing && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <button
              onClick={handleArchiveToggle}
              disabled={acting}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #2A4A38', background: 'transparent', color: '#DCEFE3', fontSize: 13, cursor: 'pointer' }}
            >
              {rider.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
              {rider.archived ? 'Unarchive' : 'Archive'}
            </button>
            <button
              onClick={handleDelete}
              disabled={acting}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #5A2A2A', background: 'transparent', color: '#F5A3A3', fontSize: 13, cursor: 'pointer' }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}

        {editing ? (
          <>
            <div style={section}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#05C16A' }}>Edit Rider Details</h2>

              <label style={editLabelStyle}>Full Name</label>
              <input style={editInputStyle} value={editForm.fullName} onChange={updateField('fullName')} />

              <label style={editLabelStyle}>Phone</label>
              <input style={editInputStyle} value={editForm.phone} onChange={updateField('phone')} />

              <label style={editLabelStyle}>Email</label>
              <input style={editInputStyle} value={editForm.email} onChange={updateField('email')} />

              <label style={editLabelStyle}>Address</label>
              <input style={editInputStyle} value={editForm.address} onChange={updateField('address')} />

              <label style={editLabelStyle}>Ghana Card Number</label>
              <input style={editInputStyle} value={editForm.ghanaIdNumber} onChange={updateField('ghanaIdNumber')} />

              <label style={editLabelStyle}>License Number</label>
              <input style={editInputStyle} value={editForm.licenseNumber} onChange={updateField('licenseNumber')} />
            </div>

            {editForm.guarantor && (
              <div style={section}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#05C16A' }}>Edit Guarantor</h2>

                <label style={editLabelStyle}>Full Name</label>
                <input style={editInputStyle} value={editForm.guarantor.fullName} onChange={updateGuarantorField('fullName')} />

                <label style={editLabelStyle}>Phone</label>
                <input style={editInputStyle} value={editForm.guarantor.phone} onChange={updateGuarantorField('phone')} />

                <label style={editLabelStyle}>Email</label>
                <input style={editInputStyle} value={editForm.guarantor.email} onChange={updateGuarantorField('email')} />

                <label style={editLabelStyle}>Address</label>
                <input style={editInputStyle} value={editForm.guarantor.address} onChange={updateGuarantorField('address')} />

                <label style={editLabelStyle}>Ghana Card Number</label>
                <input style={editInputStyle} value={editForm.guarantor.ghanaIdNumber} onChange={updateGuarantorField('ghanaIdNumber')} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1, padding: 16, borderRadius: 12, border: 'none', background: '#05C16A', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                style={{ flex: 1, padding: 16, borderRadius: 12, border: '1px solid #2A4A38', background: 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={section}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#05C16A' }}>Rider Details</h2>
              {row('Phone', rider.phone)}
              {row('Email', rider.email)}
              {row('Address', rider.address)}
              {row('Ghana Card Number', rider.ghana_id_number)}
              {row('License Number', rider.license_number)}
              {rider.latitude && (
                <div style={{ padding: '10px 0' }}>
                  <a href={mapsLink(rider.latitude, rider.longitude)} target="_blank" style={{ color: '#05C16A', fontSize: 14 }}>
                    Open Location in Google Maps →
                  </a>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                {rider.ghana_id_signed_url && (
                  <img
                    src={rider.ghana_id_signed_url}
                    alt="Ghana Card"
                    style={thumbStyle}
                    onClick={() => setLightboxImage({ src: rider.ghana_id_signed_url, alt: 'Ghana Card' })}
                  />
                )}
                {rider.license_signed_url && (
                  <img
                    src={rider.license_signed_url}
                    alt="License"
                    style={thumbStyle}
                    onClick={() => setLightboxImage({ src: rider.license_signed_url, alt: 'Driving License' })}
                  />
                )}
              </div>
            </div>

            {guarantor && (
              <div style={section}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#05C16A' }}>Guarantor</h2>
                {row('Full Name', guarantor.full_name)}
                {row('Phone', guarantor.phone)}
                {row('Email', guarantor.email)}
                {row('Address', guarantor.address)}
                {row('Ghana Card Number', guarantor.ghana_id_number)}
                {guarantor.latitude && (
                  <div style={{ padding: '10px 0' }}>
                    <a href={mapsLink(guarantor.latitude, guarantor.longitude)} target="_blank" style={{ color: '#05C16A', fontSize: 14 }}>
                      Open Location in Google Maps →
                    </a>
                  </div>
                )}
                {guarantor.ghana_id_signed_url && (
                  <img
                    src={guarantor.ghana_id_signed_url}
                    alt="Guarantor Ghana Card"
                    style={{ ...thumbStyle, marginTop: 12 }}
                    onClick={() => setLightboxImage({ src: guarantor.ghana_id_signed_url, alt: "Guarantor's Ghana Card" })}
                  />
                )}
              </div>
            )}

            {rider.status === 'rejected' && rider.rejection_reason && (
              <div style={{ ...section, borderLeft: '3px solid #F5A3A3' }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: '#F5A3A3' }}>Rejection Reason</h2>
                <p style={{ fontSize: 14, color: '#DCEFE3' }}>{rider.rejection_reason}</p>
              </div>
            )}

            {rider.status === 'pending' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleApprove}
                  disabled={acting}
                  style={{ flex: 1, padding: 16, borderRadius: 12, border: 'none', background: '#05C16A', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={acting}
                  style={{ flex: 1, padding: 16, borderRadius: 12, border: 'none', background: '#F5A3A3', color: '#0E2A1D', fontWeight: 700, cursor: 'pointer' }}
                >
                  Reject
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showRejectDialog && (
        <RejectDialog
          onCancel={() => setShowRejectDialog(false)}
          onConfirm={handleReject}
          submitting={acting}
        />
      )}

      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {toastMessage && <SuccessToast message={toastMessage} />}
    </div>
  );
}