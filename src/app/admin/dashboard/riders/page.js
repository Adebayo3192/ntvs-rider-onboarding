'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import AddRiderModal from './AddRiderModal';

const statusColors = {
  pending: '#F5C242',
  approved: '#05C16A',
  rejected: '#F5A3A3',
};

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [viewArchived, setViewArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchRiders = async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, status, archived: viewArchived });
    const res = await fetch(`/api/admin/riders?${params}`);
    const data = await res.json();
    setRiders(data);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(fetchRiders, 300);
    return () => clearTimeout(timeout);
  }, [search, status, viewArchived]);

  const tabStyle = (active) => ({
    padding: '8px 16px',
    borderRadius: 10,
    border: 'none',
    background: active ? '#05C16A' : 'transparent',
    color: active ? '#0E2A1D' : '#DCEFE3',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0E2A1D, #173D28)', color: '#fff', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Riders</h1>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#05C16A', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            + Add Rider
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          <button onClick={() => setViewArchived(false)} style={tabStyle(!viewArchived)}>
            Active
          </button>
          <button onClick={() => setViewArchived(true)} style={tabStyle(viewArchived)}>
            Archived
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid #2A4A38', borderRadius: 12, padding: '10px 14px' }}>
            <Search size={16} color="#7FB89E" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 15 }}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #2A4A38', background: '#173D28', color: '#fff', fontSize: 15 }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr', padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#7FB89E', borderBottom: '1px solid #2A4A38' }}>
            <div>Name</div>
            <div>Phone</div>
            <div>Status</div>
            <div>Date Submitted</div>
          </div>

          {loading && (
            <div style={{ padding: 20, textAlign: 'center', color: '#7FB89E' }}>Loading...</div>
          )}

          {!loading && riders.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: '#7FB89E' }}>
              {viewArchived ? 'No archived riders.' : 'No riders found.'}
            </div>
          )}

          {!loading && riders.map((r) => (
            <Link
              key={r.id}
              href={`/admin/dashboard/riders/${r.id}`}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr', padding: '14px 20px', fontSize: 14, borderBottom: '1px solid #2A4A38', color: '#fff', textDecoration: 'none' }}
            >
              <div>{r.full_name || '—'}</div>
              <div>{r.phone || '—'}</div>
              <div>
                <span style={{ background: statusColors[r.status], color: '#0E2A1D', fontWeight: 700, fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>
                  {r.status}
                </span>
              </div>
              <div>{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '—'}</div>
            </Link>
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddRiderModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}