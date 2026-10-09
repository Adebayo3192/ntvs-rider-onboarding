'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { authedFetch } from '@/lib/authedFetch';

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const ACCENT = '#0FA45C';

const card = { background: '#fff', borderRadius: 16, border: '1px solid #E7ECE8', boxShadow: '0 2px 10px rgba(18,41,31,.04)' };
const headCell = { fontSize: 10.5, fontWeight: 800, color: '#5D6C65', letterSpacing: '.2px' };
const numCell = { fontSize: 11.5, fontWeight: 700, color: '#3A4C43', textAlign: 'right' };
const strongCell = { fontSize: 11.5, fontWeight: 800, color: '#10281C', textAlign: 'right' };

const PERIODS = [
  { key: 'month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'all', label: 'All Time' },
];

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function PerformancePage() {
  const [period, setPeriod] = useState('month');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ period, search });
    authedFetch(`/api/admin/jumia/performance?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [period, search]);

  const rows = data?.rows || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: '#F0F3F1', borderRadius: 11, padding: 4 }}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: '7px 13px',
                borderRadius: 8,
                fontFamily: FONT,
                fontSize: 11.5,
                fontWeight: 800,
                background: period === p.key ? '#fff' : 'transparent',
                color: period === p.key ? '#10281C' : '#7C8A83',
                boxShadow: period === p.key ? '0 1px 4px rgba(18,41,31,.1)' : 'none',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 160, position: 'relative' }}>
          <Search size={14} color="#9AA8A0" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rider..."
            style={{ width: '100%', height: 36, boxSizing: 'border-box', padding: '0 12px 0 34px', borderRadius: 10, border: '1px solid #E2E9E4', background: '#fff', fontFamily: FONT, fontSize: 12.5, color: '#10281C' }}
          />
        </div>
      </div>

      <div style={{ ...card, padding: '12px 14px 6px' }}>
        <div className="ntvl-table-scroll">
          <div className="ntvl-table-track">
            <div style={{ display: 'grid', gridTemplateColumns: '30px 1.6fr .8fr .6fr .6fr .8fr .9fr 1fr', gap: 8, padding: '7px 3px', borderBottom: '1px solid #EDF1EE' }}>
              <span style={headCell}>#</span>
              <span style={headCell}>Rider</span>
              <span style={{ ...headCell, textAlign: 'right' }}>Reports</span>
              <span style={{ ...headCell, textAlign: 'right' }}>Small</span>
              <span style={{ ...headCell, textAlign: 'right' }}>Medium</span>
              <span style={{ ...headCell, textAlign: 'right' }}>Packages</span>
              <span style={{ ...headCell, textAlign: 'right' }}>Avg/Report</span>
              <span style={{ ...headCell, textAlign: 'right' }}>Amount</span>
            </div>

            {loading && <div style={{ padding: '18px 3px', fontSize: 12, color: '#9AA8A0' }}>Loading...</div>}
            {!loading && rows.length === 0 && <div style={{ padding: '18px 3px', fontSize: 12, color: '#9AA8A0' }}>No reports for this period.</div>}

            {rows.map((r) => (
              <div key={r.rank} style={{ display: 'grid', gridTemplateColumns: '30px 1.6fr .8fr .6fr .6fr .8fr .9fr 1fr', gap: 8, padding: '9px 3px', alignItems: 'center', borderBottom: '1px solid #F4F7F5' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#8D9A93' }}>{r.rank}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                  <div style={{ flex: 'none', width: 24, height: 24, borderRadius: '50%', background: '#DCF4E6', color: '#04763F', fontSize: 9.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(r.name)}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1B332A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                </div>
                <span style={numCell}>{r.reports}</span>
                <span style={numCell}>{r.small}</span>
                <span style={numCell}>{r.medium}</span>
                <span style={numCell}>{r.packages}</span>
                <span style={numCell}>₵{r.avgPerReport.toFixed(2)}</span>
                <span style={strongCell}>₵{r.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}