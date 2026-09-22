'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Pencil, Archive, ArchiveRestore, Trash2, X, CheckCircle2, Check,
  User, Phone, Mail, MapPin, IdCard, Car, FileText, Copy, ExternalLink, AlertCircle,
} from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';

const card = {
  background: '#fff',
  borderRadius: 18,
  border: '1px solid #E7ECE8',
  boxShadow: '0 2px 10px rgba(18,41,31,.04)',
  overflow: 'hidden',
};

const infoRow = { display: 'grid', gridTemplateColumns: '26px 150px 1fr 20px', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F4F2' };
const infoLabel = { fontSize: 11.5, fontWeight: 600, color: '#7C8A83' };
const infoValue = { fontSize: 12, fontWeight: 700, color: '#1B332A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

const detailBtnBase = { display: 'inline-flex', alignItems: 'center', gap: 8, height: 34, padding: '0 12px', borderRadius: 10, fontFamily: FONT, fontSize: 11.5, fontWeight: 800, cursor: 'pointer', border: 'none' };
const detailBtn = { ...detailBtnBase, background: '#fff', border: '1px solid #DCE6E0', color: '#2D4038' };
const detailBtnOff = { ...detailBtnBase, background: '#F4F7F5', border: '1px solid #E7ECE8', color: '#B2BEB7', cursor: 'not-allowed' };
const detailBtnDanger = { ...detailBtnBase, background: '#fff', border: '1px solid #F3CFD2', color: '#D4494E' };

const idCardStyle = { display: 'flex', flexDirection: 'column', gap: 3, padding: '7px 8px', borderRadius: 8, background: '#F0F3F1', border: '1px solid #DDE5E0' };

const editInputStyle = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E9E4', background: '#F7FBF8', color: '#10281C', fontSize: 14, marginBottom: 10, boxSizing: 'border-box', fontFamily: FONT };
const editLabelStyle = { fontSize: 12, fontWeight: 700, color: '#7C8A83', marginBottom: 4, display: 'block' };

function formatRiderId(riderNumber) {
  if (!riderNumber) return '—';
  return `R${String(riderNumber).padStart(4, '0')}`;
}

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

const REJECTION_REASONS = [
  'Incomplete or unclear ID/license photo',
  'Information could not be verified',
  'Guarantor information incomplete or invalid',
  'Ghana Card number invalid or expired',
  'Driving license invalid or expired',
];

function RejectDialog({ onCancel, onConfirm, submitting }) {
  const [selected, setSelected] = useState('');
  const [customReason, setCustomReason] = useState('');

  const finalReason = selected === 'Other' ? customReason.trim() : selected;
  const canSubmit = finalReason.length > 0;

  const radio = (on) => ({
    flex: 'none', width: 17, height: 17, borderRadius: '50%', boxSizing: 'border-box',
    border: `2px solid ${on ? ACCENT : '#C8D3CC'}`,
    background: on ? ACCENT : '#fff',
    boxShadow: on ? 'inset 0 0 0 3px #fff' : 'none',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,40,28,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 2000, fontFamily: FONT }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: '20px 22px', width: '100%', maxWidth: 480, boxShadow: '0 26px 60px rgba(14,42,29,.22)', border: '1px solid #E7ECE8' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
            <circle cx="12" cy="12" r="9" stroke="#E5484D" strokeWidth="2" />
            <path d="M5.8 5.8l12.4 12.4" stroke="#E5484D" strokeWidth="2" />
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#10281C' }}>Reject Rider</div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: '#7C8A83', marginTop: 3 }}>Please select a reason for rejection</div>
          </div>
          <X size={18} color="#9AA8A0" style={{ cursor: 'pointer', flex: 'none' }} onClick={onCancel} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px', marginTop: 16 }}>
          {REJECTION_REASONS.map((reason) => (
            <div key={reason} onClick={() => setSelected(reason)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <span style={radio(selected === reason)} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#3A4C43' }}>{reason}</span>
            </div>
          ))}
          <div onClick={() => setSelected('Other')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <span style={radio(selected === 'Other')} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#3A4C43' }}>Other (specify)</span>
          </div>
        </div>

        {selected === 'Other' && (
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Enter reason"
            style={{ width: '100%', boxSizing: 'border-box', height: 44, marginTop: 14, padding: '0 14px', borderRadius: 12, background: '#F7FBF8', border: '1px solid #E2E9E4', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: '#10281C' }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button onClick={onCancel} style={{ height: 46, padding: '0 26px', borderRadius: 13, background: '#F4F7F5', border: '1px solid #E2E9E4', fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#3A4C43', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(finalReason)}
            disabled={!canSubmit || submitting}
            style={{ height: 46, padding: '0 26px', borderRadius: 13, border: 'none', background: canSubmit ? '#E5484D' : '#E9C4C6', fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#fff', cursor: canSubmit ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <X size={15} /> {submitting ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageLightbox({ src, alt, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,25,18,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 3000, cursor: 'zoom-out' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
        <X size={20} />
      </button>
      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 12, objectFit: 'contain', cursor: 'default' }} />
    </div>
  );
}

function SuccessToast({ message }) {
  return (
    <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 13, padding: '14px 18px', borderRadius: 15, background: '#fff', border: '1px solid #CFEDDD', borderLeft: `5px solid ${ACCENT}`, boxShadow: '0 10px 26px rgba(18,41,31,.09)', zIndex: 4000, fontFamily: FONT }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
        <circle cx="12" cy="12" r="10" fill="#DCF4E6" />
        <circle cx="12" cy="12" r="7" fill={ACCENT} />
        <path d="M8.8 12.2l2.2 2.2 4.2-4.6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#10281C' }}>{message}</div>
    </div>
  );
}

function MapBox({ lat, lng }) {
  const [activated, setActivated] = useState(false);
  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative', width: '100%', height: 108, borderRadius: 11, overflow: 'hidden', border: '1px solid #DFE7E2', background: '#EAEFEB' }}>
        <iframe
          title="location"
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
          style={{ width: '100%', height: '100%', border: 0, pointerEvents: activated ? 'auto' : 'none' }}
          tabIndex={-1}
        />
        {!activated && (
          <div
            onClick={() => setActivated(true)}
            onTouchStart={() => setActivated(true)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: 6,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(16,40,28,.72)', padding: '3px 9px', borderRadius: 999 }}>
              Tap to interact with map
            </span>
          </div>
        )}
      </div>
      <a
        href={mapsLink}
        target="_blank"
        rel="noreferrer"
        style={{ width: '100%', height: 36, borderRadius: 10, background: '#fff', border: '1px solid #AEE4C6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: FONT, fontSize: 11.5, fontWeight: 800, color: '#04763F', cursor: 'pointer', boxSizing: 'border-box', textDecoration: 'none' }}
      >
        <MapPin size={15} /> Open in Google Maps <ExternalLink size={13} />
      </a>
    </div>
  );
}

function DocThumb({ label, docLabel, signedUrl, onView }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minWidth: 0 }}>
      <span style={{ fontSize: 11.5, fontWeight: 800, color: '#2D4038' }}>{label}</span>
      <div style={idCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 13, height: 9, background: 'linear-gradient(90deg,#CE1126 33%,#FCD116 33% 66%,#006B3F 66%)', borderRadius: 1 }} />
          <span style={{ fontSize: 7.5, fontWeight: 800, color: '#1B332A' }}>REPUBLIC OF GHANA</span>
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color: '#04763F' }}>{docLabel}</span>
        <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
          {signedUrl ? (
            <img src={signedUrl} alt={label} onClick={() => onView(signedUrl, label)} style={{ flex: 'none', width: 48, height: 40, objectFit: 'cover', borderRadius: 3, border: '1px solid #C3CEC8', cursor: 'zoom-in' }} />
          ) : (
            <div style={{ flex: 'none', width: 34, height: 40, borderRadius: 3, background: '#D6DEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #C3CEC8' }}>
              <FileText size={16} color="#7C8A83" />
            </div>
          )}
        </div>
      </div>
      {signedUrl && (
        <span onClick={() => onView(signedUrl, label)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#04763F', cursor: 'pointer' }}>
          <ExternalLink size={12} /> View full size
        </span>
      )}
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

  useEffect(() => { load(); }, [id]);

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

  const updateField = (field) => (e) => setEditForm({ ...editForm, [field]: e.target.value });
  const updateGuarantorField = (field) => (e) => setEditForm({ ...editForm, guarantor: { ...editForm.guarantor, [field]: e.target.value } });

  const goBackWithMessage = (message) => {
    setToastMessage(message);
    setTimeout(() => router.push('/admin/dashboard/riders'), 1200);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/riders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
    setSaving(false);
    setEditing(false);
    load();
    goBackWithMessage('Rider details updated');
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this rider?')) return;
    setActing(true);
    await fetch(`/api/admin/riders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) });
    setActing(false);
    goBackWithMessage('Rider approved');
  };

  const handleReject = async (reason) => {
    setActing(true);
    await fetch(`/api/admin/riders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected', reason }) });
    setActing(false);
    setShowRejectDialog(false);
    goBackWithMessage('Rider rejected');
  };

  const handleArchiveToggle = async () => {
    const nextArchived = !data.rider.archived;
    if (!confirm(`Are you sure you want to ${nextArchived ? 'archive' : 'unarchive'} this rider?`)) return;
    setActing(true);
    await fetch(`/api/admin/riders/${id}/archive`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived: nextArchived }) });
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
    return <div style={{ padding: 32, color: '#9AA8A0', fontFamily: FONT }}>Loading...</div>;
  }

  const { rider, guarantor } = data;
  const av = { bg: '#DCF4E6', ink: '#04763F' };
  const statusPill = {
    pending: { c: '#8A6100', bg: '#FDF0D4', b: '#F5DFA8' },
    approved: { c: '#04763F', bg: '#DCF4E6', b: '#AEE4C6' },
    rejected: { c: '#C13239', bg: '#FDE4E6', b: '#F6C6C9' },
  }[rider.status];

  const personalRows = [
    { icon: Phone, label: 'Phone', value: rider.phone },
    { icon: Mail, label: 'Email', value: rider.email },
    { icon: MapPin, label: 'Address', value: rider.address },
    { icon: IdCard, label: 'Ghana Card Number', value: rider.ghana_id_number },
    { icon: Car, label: 'Driving License Number', value: rider.license_number },
  ];

  const guarantorRows = guarantor
    ? [
        { icon: User, label: 'Full Name', value: guarantor.full_name },
        { icon: Phone, label: 'Phone', value: guarantor.phone },
        { icon: MapPin, label: 'Address', value: guarantor.address },
        { icon: IdCard, label: 'Ghana Card Number', value: guarantor.ghana_id_number },
      ]
    : [];

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 14px 18px', display: 'flex', flexDirection: 'column', gap: 12, fontFamily: FONT }}>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 'none', width: 50, height: 50, borderRadius: '50%', background: av.bg, color: av.ink, fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {initials(rider.full_name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: '-.5px', color: '#10281C', wordBreak: 'break-word' }}>{rider.full_name || 'Rider'}</h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: statusPill.c, background: statusPill.bg, border: `1px solid ${statusPill.b}` }}>
                {rider.status.charAt(0).toUpperCase() + rider.status.slice(1)}
              </span>
              {rider.archived && (
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: '#5D6C65', background: '#EEF2EF' }}>
                  Archived
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 5 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#7C8A83' }}>Rider ID: {formatRiderId(rider.rider_number)}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#B9C4BE' }}>•</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#7C8A83' }}>
                Registered on {new Date(rider.created_at || rider.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          {!editing && (
            <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
              <button onClick={rider.status === 'pending' ? handleApprove : undefined} disabled={rider.status !== 'pending' || acting} style={rider.status === 'pending' ? detailBtn : detailBtnOff}>
                <Check size={15} /> Approve
              </button>
              <button onClick={rider.status === 'pending' ? () => setShowRejectDialog(true) : undefined} disabled={rider.status !== 'pending' || acting} style={rider.status === 'pending' ? detailBtn : detailBtnOff}>
                <X size={15} /> Reject
              </button>
              <button onClick={rider.status === 'pending' ? startEditing : undefined} disabled={rider.status !== 'pending'} style={rider.status === 'pending' ? detailBtn : detailBtnOff}>
                <Pencil size={15} /> Edit
              </button>
              <button onClick={handleArchiveToggle} disabled={acting} style={detailBtn}>
                {rider.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />} {rider.archived ? 'Unarchive' : 'Archive'}
              </button>
              <button onClick={handleDelete} disabled={acting} style={detailBtnDanger}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {editing ? (
        <>
          <div style={{ ...card, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: ACCENT }}>Edit Rider Details</h2>
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
            <div style={{ ...card, padding: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, color: ACCENT }}>Edit Guarantor</h2>
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
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, height: 52, borderRadius: 14, border: 'none', background: `linear-gradient(100deg,#0BAE5E,${ACCENT})`, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: FONT }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditing(false)} disabled={saving} style={{ flex: 1, height: 52, borderRadius: 14, border: '1px solid #DCE6E0', background: '#fff', color: '#3A4C43', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: FONT }}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="ntvl-grid-3col-detail" style={{ alignItems: 'start' }}>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 15px 4px' }}>
                <User size={16} color={ACCENT} />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#10281C' }}>Personal Information</span>
              </div>
              <div style={{ padding: '2px 15px 10px' }}>
                {personalRows.map((r) => (
                  <div key={r.label} style={infoRow}>
                    <r.icon size={16} color="#8A978F" />
                    <span style={infoLabel}>{r.label}</span>
                    <span style={infoValue}>{r.value || '—'}</span>
                    {r.value && <Copy size={14} color="#A9B5AE" style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(r.value)} />}
                  </div>
                ))}
              </div>
            </div>

            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 15px 8px' }}>
                <FileText size={16} color={ACCENT} />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#10281C' }}>Documents</span>
              </div>
              <div style={{ padding: '0 15px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <DocThumb label="Ghana Card" docLabel="Ghana Card" signedUrl={rider.ghana_id_signed_url} onView={(src, alt) => setLightboxImage({ src, alt })} />
                <DocThumb label="Driving License" docLabel="Driver Licence" signedUrl={rider.license_signed_url} onView={(src, alt) => setLightboxImage({ src, alt })} />
              </div>
            </div>

            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 15px 8px' }}>
                <MapPin size={16} color={ACCENT} />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#10281C' }}>Location</span>
              </div>
              <div style={{ padding: '0 15px 12px' }}>
                {rider.latitude ? <MapBox lat={rider.latitude} lng={rider.longitude} /> : <span style={{ fontSize: 13, color: '#9AA8A0' }}>No location on file.</span>}
              </div>
            </div>
          </div>

          {guarantor && (
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 15px 8px' }}>
                <User size={16} color={ACCENT} />
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#10281C' }}>Guarantor Information</span>
              </div>
              <div className="ntvl-grid-3col-detail" style={{ padding: '0 20px 20px', alignItems: 'start' }}>
                <div style={{ padding: '3px 12px 8px', borderRadius: 12, background: '#F3FAF6', border: '1px solid #DCEFE4' }}>
                  {guarantorRows.map((r) => (
                    <div key={r.label} style={infoRow}>
                      <r.icon size={16} color="#8A978F" />
                      <span style={infoLabel}>{r.label}</span>
                      <span style={infoValue}>{r.value || '—'}</span>
                      {r.value && <Copy size={14} color="#A9B5AE" style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(r.value)} />}
                    </div>
                  ))}
                </div>
                <div style={{ padding: 10, borderRadius: 12, border: '1px solid #E7ECE8' }}>
                  <DocThumb label="Ghana Card (Guarantor)" docLabel="Ghana Card" signedUrl={guarantor.ghana_id_signed_url} onView={(src, alt) => setLightboxImage({ src, alt })} />
                </div>
                <div style={{ padding: 10, borderRadius: 12, border: '1px solid #E7ECE8' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: '#2D4038', display: 'block', marginBottom: 7 }}>Guarantor Location</span>
                  {guarantor.latitude ? <MapBox lat={guarantor.latitude} lng={guarantor.longitude} /> : <span style={{ fontSize: 13, color: '#9AA8A0' }}>No location on file.</span>}
                </div>
              </div>
            </div>
          )}

          {rider.status === 'rejected' && rider.rejection_reason && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '13px 15px', borderRadius: 13, background: '#FDF2F3', border: '1px solid #F6D6D8', borderLeft: '5px solid #E5484D' }}>
              <div style={{ flex: 'none', width: 28, height: 28, borderRadius: 9, background: '#FBDDDF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={15} color="#E5484D" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#C13239' }}>Rejection Reason</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#8A4145', marginTop: 4 }}>{rider.rejection_reason}</div>
                {rider.reviewed_at && (
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: '#B08085', marginTop: 6 }}>
                    Rejected on {new Date(rider.reviewed_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {showRejectDialog && <RejectDialog onCancel={() => setShowRejectDialog(false)} onConfirm={handleReject} submitting={acting} />}
      {lightboxImage && <ImageLightbox src={lightboxImage.src} alt={lightboxImage.alt} onClose={() => setLightboxImage(null)} />}
      {toastMessage && <SuccessToast message={toastMessage} />}
    </div>
  );
}