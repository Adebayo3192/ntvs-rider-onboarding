'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardHome() {
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetch('/api/admin/summary')
      .then((res) => res.json())
      .then((data) => setCounts(data));
  }, []);

  const cardStyle = {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 20,
    textAlign: 'center',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0E2A1D, #173D28)', color: '#fff', padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 24 }}>Dashboard</h1>

        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#F5C242' }}>{counts.pending}</div>
            <div style={{ fontSize: 13, color: '#B7D4C4', marginTop: 4 }}>Pending</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#05C16A' }}>{counts.approved}</div>
            <div style={{ fontSize: 13, color: '#B7D4C4', marginTop: 4 }}>Approved</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#F5A3A3' }}>{counts.rejected}</div>
            <div style={{ fontSize: 13, color: '#B7D4C4', marginTop: 4 }}>Rejected</div>
          </div>
        </div>

        <Link
          href="/admin/dashboard/riders"
          style={{
            display: 'inline-block',
            padding: '14px 24px',
            borderRadius: 12,
            background: '#05C16A',
            color: '#fff',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          View All Riders →
        </Link>
      </div>
    </div>
  );
}