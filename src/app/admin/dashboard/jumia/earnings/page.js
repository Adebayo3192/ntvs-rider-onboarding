'use client';

import { useEffect, useState } from 'react';
import { CircleDollarSign, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';

const card = { background: '#fff', borderRadius: 16, border: '1px solid #E7ECE8', boxShadow: '0 2px 10px rgba(18,41,31,.04)' };
const kpiCard = { ...card, padding: '13px 13px 12px' };
const chartCard = { ...card, padding: '14px 16px 12px' };
const headCell = { fontSize: 10.5, fontWeight: 800, color: '#5D6C65', letterSpacing: '.2px' };
const numCell = { fontSize: 11.5, fontWeight: 700, color: '#3A4C43', textAlign: 'right' };
const strongCell = { fontSize: 11.5, fontWeight: 800, color: '#10281C', textAlign: 'right' };

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function MonthlyBarChart({ data }) {
  const W = 300, H = 140, PAD = 26;
  const max = Math.max(1, ...data.map((d) => d.amount));
  const step = (W - PAD * 2) / data.length;
  const barW = step * 0.5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 140, display: 'block' }}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={H - PAD - f * (H - PAD * 2)} y2={H - PAD - f * (H - PAD * 2)} stroke="#EDF1EE" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const h = (d.amount / max) * (H - PAD * 2);
        const x = PAD + i * step + (step - barW) / 2;
        const y = H - PAD - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={Math.max(h, 0.5)} rx="3" fill={ACCENT} />
            <text x={x + barW / 2} y={y - 5} fontSize="7.5" fontWeight="700" fill="#3A4C43" textAnchor="middle" fontFamily={FONT}>
              {d.amount > 0 ? `₵${Math.round(d.amount)}` : ''}
            </text>
            <text x={x + barW / 2} y={H - 8} fontSize="8" fill="#8D9A93" textAnchor="middle" fontFamily={FONT}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function EarningsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/jumia/earnings').then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return <div style={{ fontSize: 13, color: '#9AA8A0', fontFamily: FONT }}>Loading...</div>;
  }

  const { kpis, monthly, riders } = data;

  const kpiList = [
    { icon: CircleDollarSign, bg: '#DCF4E6', color: ACCENT, label: 'Total Earnings', value: `₵${kpis.totalAmount.toFixed(2)}`, sub: 'all-time' },
    { icon: CheckCircle2, bg: '#E3EEFB', color: '#2E5C86', label: 'Settled', value: `₵${kpis.settledAmount.toFixed(2)}`, sub: 'already paid out' },
    { icon: Clock, bg: '#FDF0D4', color: '#B8860B', label: 'Unsettled', value: `₵${kpis.unsettledAmount.toFixed(2)}`, sub: 'awaiting settlement' },
    { icon: TrendingUp, bg: '#F3E8FB', color: '#7A4A9E', label: 'This Month', value: `₵${kpis.thisMonthAmount.toFixed(2)}`, sub: 'earned so far' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: FONT }}>
      <div className="ntvl-grid-4">
        {kpiList.map((k) => (
          <div key={k.label} style={kpiCard}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 'none', width: 34, height: 34, borderRadius: 11, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={16} color={k.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6E7D76' }}>{k.label}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#10281C', marginTop: 3, letterSpacing: '-.4px' }}>{k.value}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#8D9A93', marginTop: 2 }}>{k.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={chartCard}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: '#10281C', marginBottom: 8 }}>Earnings by Month (Last 6 Months)</div>
        <MonthlyBarChart data={monthly} />
      </div>

      <div style={{ ...card, padding: '12px 14px 6px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#10281C', padding: '2px 2px 10px' }}>Earnings by Rider (All-Time)</div>
        <div className="ntvl-table-scroll">
          <div className="ntvl-table-track">
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr .7fr .9fr .9fr .9fr', gap: 8, padding: '7px 3px', borderBottom: '1px solid #EDF1EE' }}>
              <span style={headCell}>Rider</span>
              <span style={{ ...headCell, textAlign: 'right' }}>Reports</span>
              <span style={{ ...headCell, textAlign: 'right' }}>Settled</span>
              <span style={{ ...headCell, textAlign: 'right' }}>Unsettled</span>
              <span style={{ ...headCell, textAlign: 'right' }}>Total</span>
            </div>
            {riders.length === 0 && <div style={{ padding: '18px 3px', fontSize: 12, color: '#9AA8A0' }}>No earnings recorded yet.</div>}
            {riders.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr .7fr .9fr .9fr .9fr', gap: 8, padding: '9px 3px', alignItems: 'center', borderBottom: '1px solid #F4F7F5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                  <div style={{ flex: 'none', width: 24, height: 24, borderRadius: '50%', background: '#DCF4E6', color: '#04763F', fontSize: 9.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(r.name)}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1B332A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                </div>
                <span style={numCell}>{r.reports}</span>
                <span style={numCell}>₵{r.settled.toFixed(2)}</span>
                <span style={{ ...numCell, color: r.unsettled > 0 ? '#B8860B' : '#3A4C43' }}>₵{r.unsettled.toFixed(2)}</span>
                <span style={strongCell}>₵{r.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}