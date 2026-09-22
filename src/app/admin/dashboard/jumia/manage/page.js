'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';
const M_COLS = '1.5fr 1.2fr .8fr .8fr 1fr';

const headCell = { fontSize: 11, fontWeight: 800, color: '#5D6C65', letterSpacing: '.2px' };

const card = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #E7ECE8',
  boxShadow: '0 2px 10px rgba(18,41,31,.04)',
  overflow: 'hidden',
};

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function ManageRidersPage() {
  const [riders, setRiders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchRiders = async () => {
    setLoading(true);
    const params = new URLSearchParams({ search });
    const res = await fetch(`/api/admin/jumia/manage?${params}`);
    const data = await res.json();
    setRiders(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(fetchRiders, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleToggle = async (rider) => {
    setBusyId(rider.id);
    setRiders((prev) => prev.map((r) => (r.id === rider.id ? { ...r, enabled: !r.enabled } : r)));
    await fetch('/api/admin/jumia/toggle', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riderId: rider.id, enabled: !rider.enabled }),
    });
    setBusyId(null);
  };

  const handleResetPin = async (rider) => {
    if (!confirm(`Reset ${rider.name}'s PIN? They'll be asked to create a new one next time.`)) return;
    setBusyId(rider.id);
    await fetch('/api/admin/jumia/reset-pin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riderId: rider.id }),
    });
    setRiders((prev) => prev.map((r) => (r.id === rider.id ? { ...r, hasPin: false } : r)));
    setBusyId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: FONT }}>
      <div style={card}>
      <div className="ntvl-table-scroll">
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px 12px', borderBottom: '1px solid #F1F4F2', flexWrap: 'wrap' }}>
          <span style={{ flex: 'none', fontSize: 14, fontWeight: 800, color: '#10281C' }}>Jumia Access</span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 9, height: 38, padding: '0 12px', borderRadius: 11, background: '#F7FBF8', border: '1px solid #E2E9E4', boxSizing: 'border-box' }}>
            <Search size={14} color="#9AA8A0" style={{ flex: 'none' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rider name..."
              style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: '#10281C', outline: 'none' }}
            />
          </div>
        </div>

        <div className="ntvl-table-track" style={{ display: 'grid', gridTemplateColumns: M_COLS, gap: 10, padding: '10px 16px', background: '#F5F9F6', borderBottom: '1px solid #E7ECE8' }}>
          <span style={headCell}>Rider Name</span>
          <span style={headCell}>Phone</span>
          <span style={headCell}>Jumia Status</span>
          <span style={headCell}>PIN Status</span>
          <span style={headCell}>Actions</span>
        </div>

        {loading && <div style={{ padding: 18, textAlign: 'center', fontSize: 12.5, color: '#9AA8A0' }}>Loading...</div>}
        {!loading && riders.length === 0 && <div style={{ padding: 18, textAlign: 'center', fontSize: 12.5, color: '#9AA8A0' }}>No riders found.</div>}

        {!loading && riders.map((r) => (
          <div key={r.id} className="ntvl-table-track" style={{ display: 'grid', gridTemplateColumns: M_COLS, gap: 10, padding: '9px 16px', alignItems: 'center', borderBottom: '1px solid #F1F4F2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
              <div style={{ flex: 'none', width: 30, height: 30, borderRadius: '50%', background: r.enabled ? '#DCF4E6' : '#EEF3F0', color: r.enabled ? '#04763F' : '#9AA8A0', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {initials(r.name)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: r.enabled ? '#1B332A' : '#8D9A93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
            </div>

            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#3A4C43' }}>{r.phone}</span>

            <div
              onClick={() => busyId !== r.id && handleToggle(r)}
              style={{
                width: 42, height: 24, borderRadius: 999, padding: 2, boxSizing: 'border-box', cursor: busyId === r.id ? 'default' : 'pointer',
                display: 'flex', justifyContent: r.enabled ? 'flex-end' : 'flex-start',
                background: r.enabled ? ACCENT : '#D4DCD7', transition: 'background .18s', opacity: busyId === r.id ? 0.6 : 1,
              }}
            >
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,.18)' }} />
            </div>

            <span style={r.hasPin
              ? { justifySelf: 'start', padding: '4px 11px', borderRadius: 999, fontSize: 10, fontWeight: 800, color: '#04763F', background: '#DCF4E6', border: '1px solid #AEE4C6' }
              : { justifySelf: 'start', padding: '4px 11px', borderRadius: 999, fontSize: 10, fontWeight: 800, color: '#C13239', background: '#FDECEE', border: '1px solid #F7D2D6' }}>
              {r.hasPin ? 'Set' : 'Not Set'}
            </span>

            {r.hasPin ? (
              <span
                onClick={() => busyId !== r.id && handleResetPin(r)}
                style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 12px', borderRadius: 9, background: '#fff', border: '1px solid #DCE6E0', fontSize: 11, fontWeight: 800, color: '#2D4038', cursor: 'pointer' }}
              >
                Reset PIN
              </span>
            ) : (
              <span style={{ justifySelf: 'start', fontSize: 11.5, fontWeight: 700, color: '#B2BEB7' }}>—</span>
            )}
          </div>
        ))}
      </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '13px 16px', borderRadius: 13, background: '#fff', border: '1px solid #E7ECE8' }}>
        <div style={{ flex: 'none', width: 34, height: 34, borderRadius: 11, background: '#EEF3F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.4" stroke="#8D9A93" strokeWidth="1.9" />
            <path d="M5.5 20c0-3.6 2.9-5.6 6.5-5.6s6.5 2 6.5 5.6" stroke="#8D9A93" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: '#10281C' }}>No more riders?</div>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: '#6E7D76', marginTop: 2 }}>
            Only riders with Jumia access can submit delivery reports. Enable a rider above to let them submit.
          </div>
        </div>
      </div>
    </div>
  );
}