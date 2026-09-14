'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, ChevronDown, Phone, MapPin, Calendar, Eye, Pencil, MoreVertical, Circle, Copy, Check } from 'lucide-react';
import AddRiderModal from './AddRiderModal';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';

const PILLS = {
  pending: { c: '#8A6100', bg: '#FDF0D4', b: '#F5DFA8' },
  approved: { c: '#04763F', bg: '#DCF4E6', b: '#AEE4C6' },
  rejected: { c: '#C13239', bg: '#FDE4E6', b: '#F6C6C9' },
};

const STATS_META = {
  total: { icon: Users, color: ACCENT, bg: '#DCF4E6' },
  pending: { icon: Circle, color: '#E0A008', bg: '#FDF0D4' },
  approved: { icon: Circle, color: ACCENT, bg: '#DCF4E6' },
  rejected: { icon: Circle, color: '#E5484D', bg: '#FDE4E6' },
};

const AVATAR_TINTS = [
  { tint: '#E3EEFB', ink: '#2E5C86' },
  { tint: '#FDF0D4', ink: '#8A6100' },
  { tint: '#DCF4E6', ink: '#04763F' },
  { tint: '#F7E6F0', ink: '#8E4A75' },
  { tint: '#EDE8FA', ink: '#5A4A9E' },
];

const card = {
  background: '#fff',
  borderRadius: 18,
  border: '1px solid #E7ECE8',
  boxShadow: '0 2px 10px rgba(18,41,31,.04)',
  overflow: 'hidden',
};

function formatRiderId(riderNumber) {
  if (!riderNumber) return '—';
  return `R${String(riderNumber).padStart(4, '0')}`;
}

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function tintFor(id) {
  const hash = (id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [viewArchived, setViewArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyPhone = (id, phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const fetchRiders = async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, status, archived: viewArchived });
    const res = await fetch(`/api/admin/riders?${params}`);
    const data = await res.json();
    setRiders(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(fetchRiders, 300);
    return () => clearTimeout(timeout);
  }, [search, status, viewArchived]);

  useEffect(() => {
    fetch('/api/admin/summary')
      .then((res) => res.json())
      .then((data) => setCounts(data));
  }, []);

  const stats = [
    { key: 'total', label: 'Total Riders', count: counts.total ?? 0, sub: 'Registered on the system' },
    { key: 'approved', label: 'Active Riders', count: counts.approved ?? 0, sub: 'Ready for assignments' },
    { key: 'pending', label: 'Pending Approval', count: counts.pending ?? 0, sub: 'Awaiting verification' },
    { key: 'rejected', label: 'Rejected', count: counts.rejected ?? 0, sub: "Doesn't meet requirements" },
  ];

  const tabStyle = (active) => ({
    padding: '6px 14px',
    borderRadius: 9,
    border: 'none',
    background: active ? ACCENT : 'transparent',
    color: active ? '#fff' : '#5D6C65',
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: FONT,
  });

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 24px 20px', fontFamily: FONT }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ flex: 'none', width: 40, height: 40, borderRadius: 13, background: '#DCF4E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={19} color={ACCENT} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: '-.5px', color: '#10281C' }}>Riders</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 500, color: '#6E7D76' }}>
            Manage rider onboarding, track status and keep your delivery team active.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            flex: 'none',
            height: 40,
            padding: '0 18px',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontFamily: FONT,
            fontSize: 12.5,
            fontWeight: 800,
            color: '#fff',
            background: `linear-gradient(100deg,#0BAE5E,${ACCENT})`,
            boxShadow: '0 10px 24px rgba(5,193,106,.28)',
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
          <span>Add Rider</span>
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
        {stats.map((s) => {
          const meta = STATS_META[s.key];
          const Icon = meta.icon;
          return (
            <div key={s.key} style={{ ...card, padding: '13px 15px 11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 'none', width: 36, height: 36, borderRadius: 12, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color={meta.color} fill={meta.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.5px', color: '#10281C', lineHeight: 1.05 }}>{s.count}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: '#2D4038' }}>{s.label}</span>
                </div>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: '#8A978F', marginTop: 7, display: 'block' }}>{s.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Active/Archived tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, background: '#EEF3EF', padding: 3, borderRadius: 11, width: 'fit-content' }}>
        <button onClick={() => setViewArchived(false)} style={tabStyle(!viewArchived)}>Active</button>
        <button onClick={() => setViewArchived(true)} style={tabStyle(viewArchived)}>Archived</button>
      </div>

      {/* Search + filter row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 9, height: 40, padding: '0 13px', borderRadius: 12, background: '#fff', border: '1px solid #E2E9E4', boxSizing: 'border-box' }}>
          <Search size={15} color="#9AA8A0" style={{ flex: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', fontFamily: FONT, fontSize: 13, fontWeight: 500, color: '#10281C', outline: 'none' }}
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            flex: 'none',
            height: 40,
            padding: '0 12px',
            borderRadius: 12,
            background: '#fff',
            border: '1px solid #E2E9E4',
            fontSize: 12,
            fontWeight: 700,
            color: '#3A4C43',
            fontFamily: FONT,
            cursor: 'pointer',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.15fr .95fr 1.05fr 1.15fr', gap: 10, padding: '10px 16px', background: '#F5F9F6', borderBottom: '1px solid #E7ECE8' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#5D6C65', letterSpacing: '.2px' }}>Name</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#5D6C65', letterSpacing: '.2px' }}>Phone</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#5D6C65', letterSpacing: '.2px' }}>Status</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#5D6C65', letterSpacing: '.2px' }}>Date Submitted</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#5D6C65', letterSpacing: '.2px' }}>Actions</span>
        </div>

        {loading && <div style={{ padding: 24, textAlign: 'center', color: '#9AA8A0', fontSize: 13.5 }}>Loading...</div>}

        {!loading && riders.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#9AA8A0', fontSize: 13.5 }}>
            {viewArchived ? 'No archived riders.' : 'No riders found.'}
          </div>
        )}

        {!loading && riders.map((r) => {
          const pill = PILLS[r.status] || PILLS.pending;
          const av = tintFor(r.id);
          const date = r.submitted_at ? new Date(r.submitted_at) : null;
          return (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.15fr .95fr 1.05fr 1.15fr', gap: 10, padding: '9px 16px', alignItems: 'center', borderBottom: '1px solid #F1F4F2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                <div style={{ flex: 'none', width: 32, height: 32, borderRadius: '50%', background: av.tint, color: av.ink, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {initials(r.full_name)}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: '#10281C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.full_name || '—'}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#8A978F' }}>Rider ID: {formatRiderId(r.rider_number)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Phone size={14} color={ACCENT} style={{ flex: 'none' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2D4038', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.phone || '—'}</span>
                {r.phone && (
                  copiedId === r.id ? (
                    <Check size={14} color={ACCENT} style={{ flex: 'none' }} />
                  ) : (
                    <Copy size={14} color="#A9B5AE" style={{ flex: 'none', cursor: 'pointer' }} onClick={() => handleCopyPhone(r.id, r.phone)} />
                  )
                )}
              </div>

              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: pill.c, background: pill.bg, border: `1px solid ${pill.b}` }}>
                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#2D4038' }}>
                  <Calendar size={12} color="#8A978F" />
                  {date ? date.toLocaleDateString() : '—'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link
                  href={`/admin/dashboard/riders/${r.id}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 30, padding: '0 11px', borderRadius: 9, background: '#fff', border: '1px solid #DCE6E0', fontFamily: FONT, fontSize: 11, fontWeight: 800, color: '#2D4038', cursor: 'pointer', textDecoration: 'none' }}
                >
                  <Eye size={12} color={ACCENT} /> View
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && <AddRiderModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}