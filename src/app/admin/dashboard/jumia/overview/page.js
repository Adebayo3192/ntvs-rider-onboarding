'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, FileText, Package, CircleDollarSign, Clock } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';

const card = { background: '#fff', borderRadius: 16, border: '1px solid #E7ECE8', boxShadow: '0 2px 10px rgba(18,41,31,.04)' };
const kpiCard = { ...card, padding: '13px 13px 12px' };
const chartCard = { ...card, padding: '14px 16px 12px' };
const listCard = { ...card, padding: '12px 14px 6px' };
const headCell = { fontSize: 10.5, fontWeight: 800, color: '#5D6C65', letterSpacing: '.2px' };
const numCell = { fontSize: 11, fontWeight: 700, color: '#3A4C43', textAlign: 'right' };
const strongCell = { fontSize: 11, fontWeight: 800, color: '#10281C', textAlign: 'right' };
const cardLinkRow = { display: 'flex', justifyContent: 'center', padding: '9px 4px 6px', fontSize: 11.5, fontWeight: 800 };
const chartTitle = { fontSize: 12.5, fontWeight: 800, color: '#10281C', marginBottom: 8 };

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function shortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function LineChart({ data, valueKey, color = ACCENT }) {
  const W = 300, H = 130, PAD = 22;
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  const stepX = (W - PAD * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => ({
    x: PAD + i * stepX,
    y: H - PAD - (d[valueKey] / max) * (H - PAD * 2),
    d,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${H - PAD} L${points[0].x.toFixed(1)},${H - PAD} Z`;
  const labelEvery = Math.ceil(points.length / 5);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 130, display: 'block' }}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={H - PAD - f * (H - PAD * 2)} y2={H - PAD - f * (H - PAD * 2)} stroke="#EDF1EE" strokeWidth="1" />
      ))}
      <path d={areaPath} fill={color} opacity="0.08" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.3" fill={color} />
      ))}
      {points.map((p, i) =>
        i % labelEvery === 0 ? (
          <text key={i} x={p.x} y={H - 6} fontSize="7" fill="#8D9A93" textAnchor="middle" fontFamily={FONT}>
            {shortDate(p.d.date)}
          </text>
        ) : null
      )}
    </svg>
  );
}

function BarChart({ data, valueKey, color = '#2E5C86', formatValue = (v) => v }) {
  const W = 300, H = 130, PAD = 22;
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  const step = (W - PAD * 2) / data.length;
  const barW = step * 0.6;
  const labelEvery = Math.ceil(data.length / 5);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 130, display: 'block' }}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={H - PAD - f * (H - PAD * 2)} y2={H - PAD - f * (H - PAD * 2)} stroke="#EDF1EE" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const h = (d[valueKey] / max) * (H - PAD * 2);
        const x = PAD + i * step + (step - barW) / 2;
        const y = H - PAD - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={Math.max(h, 0.5)} rx="2" fill={color} />
            {i % labelEvery === 0 && (
              <text x={x + barW / 2} y={H - 6} fontSize="7" fill="#8D9A93" textAnchor="middle" fontFamily={FONT}>
                {shortDate(d.date)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ small, medium }) {
  const total = small + medium;
  const smallPct = total > 0 ? small / total : 0;
  const R = 40, CX = 56, CY = 56, STROKE = 15;
  const circumference = 2 * Math.PI * R;
  const smallLen = smallPct * circumference;
  const mediumLen = circumference - smallLen;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <svg viewBox="0 0 112 112" style={{ width: 112, height: 112, flex: 'none' }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#EDF1EE" strokeWidth={STROKE} />
        {total > 0 && (
          <>
            <circle
              cx={CX} cy={CY} r={R} fill="none" stroke={ACCENT} strokeWidth={STROKE}
              strokeDasharray={`${smallLen} ${circumference - smallLen}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`}
            />
            <circle
              cx={CX} cy={CY} r={R} fill="none" stroke="#7A4A9E" strokeWidth={STROKE}
              strokeDasharray={`${mediumLen} ${circumference - mediumLen}`}
              strokeDashoffset={-smallLen}
              strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          </>
        )}
        <text x={CX} y={CY - 2} textAnchor="middle" fontSize="15" fontWeight="800" fill="#10281C" fontFamily={FONT}>{total}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#8D9A93" fontFamily={FONT}>packages</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ flex: 'none', width: 9, height: 9, borderRadius: 3, background: ACCENT }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#3A4C43' }}>Small — {small} ({total ? Math.round(smallPct * 100) : 0}%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ flex: 'none', width: 9, height: 9, borderRadius: 3, background: '#7A4A9E' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#3A4C43' }}>Medium — {medium} ({total ? Math.round((1 - smallPct) * 100) : 0}%)</span>
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/admin/jumia/overview').then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return <div style={{ fontSize: 13, color: '#9AA8A0', fontFamily: FONT }}>Loading...</div>;
  }

  const { kpis, daily, topRiders, oldestUnsettled, recentSettlements } = data;

  const kpiList = [
    { icon: Users, bg: '#DCF4E6', color: ACCENT, label: 'Total Enabled Riders', value: kpis.totalEnabled, sub: 'currently active' },
    { icon: FileText, bg: '#E3EEFB', color: '#2E5C86', label: 'Total Reports', value: kpis.totalReports, sub: 'all-time submitted' },
    { icon: Package, bg: '#F3E8FB', color: '#7A4A9E', label: 'Total Packages', value: kpis.totalPackages, sub: 'small + medium' },
    { icon: CircleDollarSign, bg: '#DCF4E6', color: ACCENT, label: 'Total Amount', value: `₵${kpis.totalAmount.toFixed(2)}`, sub: 'all-time value' },
    { icon: Clock, bg: '#FDF0D4', color: '#B8860B', label: 'Pending Settlement', value: `₵${kpis.pendingAmount.toFixed(2)}`, sub: `${kpis.pendingCount} unpaid days` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: FONT }}>
      {/* KPI row */}
      <div className="ntvl-grid-5">
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

      {/* Charts */}
      <div className="ntvl-grid-3">
        <div style={chartCard}>
          <div style={chartTitle}>Delivery Reports Trend (14 Days)</div>
          <LineChart data={daily} valueKey="reports" color={ACCENT} />
        </div>
        <div style={chartCard}>
          <div style={chartTitle}>Amount by Day (14 Days)</div>
          <BarChart data={daily} valueKey="amount" color="#2E5C86" />
        </div>
        <div style={chartCard}>
          <div style={chartTitle}>Package Breakdown (All-Time)</div>
          <DonutChart small={kpis.totalSmall} medium={kpis.totalMedium} />
        </div>
      </div>

      {/* Three data tables */}
      <div className="ntvl-grid-3">
        <div style={listCard}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#10281C', padding: '2px 2px 10px' }}>Top Performing Riders (This Month)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '20px 1.5fr .7fr .6fr .7fr 1fr', gap: 6, padding: '7px 3px', borderBottom: '1px solid #EDF1EE' }}>
            <span style={headCell}>#</span><span style={headCell}>Rider</span><span style={{ ...headCell, textAlign: 'right' }}>Rpts</span><span style={{ ...headCell, textAlign: 'right' }}>Sm</span><span style={{ ...headCell, textAlign: 'right' }}>Md</span><span style={{ ...headCell, textAlign: 'right' }}>Amount</span>
          </div>
          {topRiders.length === 0 && <div style={{ padding: '14px 3px', fontSize: 11.5, color: '#9AA8A0' }}>No data yet this month.</div>}
          {topRiders.map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1.5fr .7fr .6fr .7fr 1fr', gap: 6, padding: '8px 3px', alignItems: 'center', borderBottom: '1px solid #F4F7F5' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#8D9A93' }}>{i + 1}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <div style={{ flex: 'none', width: 22, height: 22, borderRadius: '50%', background: '#DCF4E6', color: '#04763F', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(t.name)}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1B332A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
              </div>
              <span style={numCell}>{t.reports}</span>
              <span style={numCell}>{t.small}</span>
              <span style={numCell}>{t.medium}</span>
              <span style={strongCell}>₵{t.amount.toFixed(0)}</span>
            </div>
          ))}
          <div style={cardLinkRow}><Link href="/admin/dashboard/jumia/reports" style={{ color: ACCENT, textDecoration: 'none' }}>View All Riders →</Link></div>
        </div>

        <div style={listCard}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#10281C', padding: '2px 2px 10px' }}>Unsettled Reports (Oldest First)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.1fr .55fr .7fr .9fr .55fr', gap: 6, padding: '7px 3px', borderBottom: '1px solid #EDF1EE' }}>
            <span style={headCell}>Rider</span><span style={headCell}>Date</span><span style={{ ...headCell, textAlign: 'right' }}>Sm</span><span style={{ ...headCell, textAlign: 'right' }}>Md</span><span style={{ ...headCell, textAlign: 'right' }}>Amount</span><span style={{ ...headCell, textAlign: 'right' }}>Days</span>
          </div>
          {oldestUnsettled.length === 0 && <div style={{ padding: '14px 3px', fontSize: 11.5, color: '#9AA8A0' }}>Nothing unsettled — all caught up.</div>}
          {oldestUnsettled.map((o, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.1fr .55fr .7fr .9fr .55fr', gap: 6, padding: '8px 3px', alignItems: 'center', borderBottom: '1px solid #F4F7F5' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1B332A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#3A4C43' }}>{shortDate(o.date)}</span>
              <span style={numCell}>{o.small}</span>
              <span style={numCell}>{o.medium}</span>
              <span style={strongCell}>₵{o.amount.toFixed(0)}</span>
              <span style={{ justifySelf: 'end', padding: '2px 8px', borderRadius: 999, fontSize: 9.5, fontWeight: 800, color: '#C13239', background: '#FDECEE' }}>{o.days}</span>
            </div>
          ))}
          <div style={cardLinkRow}><Link href="/admin/dashboard/jumia/settlements" style={{ color: ACCENT, textDecoration: 'none' }}>View All Unsettled →</Link></div>
        </div>

        <div style={listCard}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#10281C', padding: '2px 2px 10px' }}>Recent Settlements</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr .85fr .8fr 1.05fr .5fr', gap: 6, padding: '7px 3px', borderBottom: '1px solid #EDF1EE' }}>
            <span style={headCell}>Rider</span><span style={{ ...headCell, textAlign: 'right' }}>Days</span><span style={{ ...headCell, textAlign: 'right' }}>Amount</span><span style={headCell}>On</span><span style={headCell}>By</span>
          </div>
          {recentSettlements.length === 0 && <div style={{ padding: '14px 3px', fontSize: 11.5, color: '#9AA8A0' }}>No settlements yet.</div>}
          {recentSettlements.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr .85fr .8fr 1.05fr .5fr', gap: 6, padding: '8px 3px', alignItems: 'center', borderBottom: '1px solid #F4F7F5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <div style={{ flex: 'none', width: 22, height: 22, borderRadius: '50%', background: '#DCF4E6', color: '#04763F', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(s.name)}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1B332A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              </div>
              <span style={numCell}>{s.days}</span>
              <span style={strongCell}>₵{s.amount.toFixed(0)}</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#3A4C43' }}>{shortDate(s.on)}</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#8D9A93' }}>{s.by}</span>
            </div>
          ))}
          <div style={cardLinkRow}><Link href="/admin/dashboard/jumia/settlements" style={{ color: ACCENT, textDecoration: 'none' }}>View All Settlements →</Link></div>
        </div>
      </div>
    </div>
  );
}