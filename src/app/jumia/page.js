'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function JumiaNameSelectPage() {
  const [riders, setRiders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/jumia/riders')
      .then((res) => res.json())
      .then((data) => {
        setRiders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filtered = riders.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (rider) => {
    router.push(`/jumia/pin?rider=${rider.id}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#0E2A1D 0%,#123522 55%,#173D28 100%)', fontFamily: FONT, color: '#fff' }}>
      <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px 0' }}>
        <img src="/logo.png" alt="NTVL" style={{ width: 96, height: 96, objectFit: 'contain', filter: 'drop-shadow(0 12px 26px rgba(0,0,0,.4))' }} />
        <span style={{ marginTop: 10, fontSize: 20, fontWeight: 800, letterSpacing: '-.5px' }}>NTVL</span>
        <h1 style={{ margin: '12px 0 0', fontSize: 21, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-.5px', textAlign: 'center' }}>
          Submit Your Delivery Report
        </h1>
        <p style={{ margin: '7px 0 0', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.7)', textAlign: 'center' }}>
          Select your name to continue.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', height: 44, marginTop: 15, padding: '0 14px', borderRadius: 14, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', boxSizing: 'border-box' }}>
          <Search size={16} color="rgba(255,255,255,.55)" style={{ flex: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your name..."
            style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', fontFamily: FONT, fontSize: 15, fontWeight: 600, color: '#fff', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 9, padding: '15px 18px 24px' }}>
        {loading && <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 20 }}>Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 20 }}>No riders found.</div>
        )}
        {!loading && filtered.map((r) => (
          <div
            key={r.id}
            onClick={() => handleSelect(r)}
            style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, height: 58, padding: '0 14px', borderRadius: 15, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', boxSizing: 'border-box', cursor: 'pointer' }}
          >
            <div style={{ flex: 'none', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)', color: '#fff', fontSize: 12.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {initials(r.name)}
            </div>
            <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 700, color: '#fff' }}>{r.name}</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flex: 'none' }}>
              <path d="M10 7l5 5-5 5" stroke="rgba(255,255,255,.55)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}