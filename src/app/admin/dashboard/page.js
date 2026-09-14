'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Clock, CheckCircle2, XCircle, ArrowUpRight, TrendingUp, Zap, Link2, PlusCircle, BarChart3, Calendar } from 'lucide-react';
import AddRiderModal from './riders/AddRiderModal';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';

const card = {
  background: '#fff',
  borderRadius: 18,
  border: '1px solid #E7ECE8',
  boxShadow: '0 2px 10px rgba(18,41,31,.04)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const hdrIconStyle = {
  flex: 'none',
  width: 30,
  height: 30,
  borderRadius: 10,
  background: 'linear-gradient(140deg,#0FB863,#059C51)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const STATS_META = {
  riders: { icon: Users, color: ACCENT, bg: '#DCF4E6' },
  pending: { icon: Clock, color: '#E0A008', bg: '#FDF0D4' },
  approved: { icon: CheckCircle2, color: ACCENT, bg: '#DCF4E6' },
  rejected: { icon: XCircle, color: '#E5484D', bg: '#FDE4E6' },
};

const PILLS = {
  pending: { c: '#8A6100', bg: '#FDF0D4' },
  approved: { c: '#04763F', bg: '#DCF4E6' },
  rejected: { c: '#C13239', bg: '#FDE4E6' },
};

const HOW_IT_WORKS = [
  'Generate a unique onboarding link',
  'Share the link with the rider (WhatsApp, SMS, etc.)',
  'Rider completes the application',
  'Review and approve the rider',
];

export default function DashboardHome() {
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [activity, setActivity] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetch('/api/admin/summary')
      .then((res) => res.json())
      .then((data) => setCounts(data));

    fetch('/api/admin/riders?search=&status=all&archived=false')
      .then((res) => res.json())
      .then((data) => setActivity(Array.isArray(data) ? data.slice(0, 5) : []));

    fetch('/api/admin/stats/weekly')
      .then((res) => res.json())
      .then((data) => setWeekly(Array.isArray(data) ? data : []));
  }, []);

  const stats = [
    { key: 'riders', label: 'Total Riders', count: counts.total ?? 0, sub: 'All-time submitted applications' },
    { key: 'pending', label: 'Pending', count: counts.pending ?? 0, sub: 'Awaiting review' },
    { key: 'approved', label: 'Approved', count: counts.approved ?? 0, sub: 'Ready for active duty' },
    { key: 'rejected', label: 'Rejected', count: counts.rejected ?? 0, sub: "Doesn't meet requirements" },
  ];

  const initials = (name) =>
    (name || '?')
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const activityVerb = (status) => {
    if (status === 'approved') return 'Application approved';
    if (status === 'rejected') return 'Application rejected';
    return 'New application';
  };

  const relativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diffMs / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 24px 20px', fontFamily: FONT }}>
      {/* Welcome header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: '-.5px', color: '#10281C' }}>
            Welcome back, Admin 👋
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 500, color: '#6E7D76' }}>
            Here's an overview of rider applications and their status.
          </p>
        </div>
        <div
          style={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '9px 14px',
            borderRadius: 12,
            background: '#fff',
            border: '1px solid #E7ECE8',
            boxShadow: '0 2px 6px rgba(18,41,31,.04)',
          }}
        >
          <Calendar size={17} color={ACCENT} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#31473C' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
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
                  <Icon size={17} color={meta.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.5px', color: '#10281C', lineHeight: 1.05 }}>{s.count}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: '#2D4038' }}>{s.label}</span>
                </div>
                <div style={{ flex: 'none', width: 20, height: 20, borderRadius: '50%', background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpRight size={11} />
                </div>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: '#8A978F', marginTop: 12 }}>{s.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.52fr) minmax(0,1fr)', gap: 12, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px 10px' }}>
              <div style={hdrIconStyle}>
                <Zap size={15} color="#fff" fill="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#10281C' }}>Recent Activity</div>
                <div style={{ fontSize: 10.5, fontWeight: 500, color: '#7C8A83', marginTop: 1 }}>Latest rider applications and updates</div>
              </div>
              <Link href="/admin/dashboard/riders" style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#05A85D', textDecoration: 'none' }}>
                View all →
              </Link>
            </div>
            <div style={{ padding: '0 15px 8px' }}>
              {activity.length === 0 && (
                <div style={{ padding: '20px 0', fontSize: 13.5, color: '#9AA8A0' }}>No activity yet.</div>
              )}
              {activity.map((a) => {
                const pill = PILLS[a.status] || PILLS.pending;
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #F1F4F2' }}>
                    <div style={{ flex: 'none', width: 30, height: 30, borderRadius: '50%', background: '#E3EEFB', color: '#2E5C86', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>
                      {initials(a.full_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#3A4C43' }}>
                        {activityVerb(a.status)}: <strong style={{ fontWeight: 800, color: '#10281C' }}>{a.full_name || 'Rider'}</strong>
                      </span>
                      <span style={{ fontSize: 9.5, fontWeight: 500, color: '#9AA8A0' }}>{relativeTime(a.submitted_at)}</span>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 800, padding: '4px 10px', borderRadius: 999, color: pill.c, background: pill.bg }}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderRadius: 14, background: 'linear-gradient(100deg,#EAF9F0,#F2FBF6)', border: '1px solid #CFEDDD' }}>
            <div style={{ flex: 'none', width: 40, height: 40, borderRadius: 12, background: '#D7F3E4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={19} color="#05A85D" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-.2px', color: '#10281C' }}>More Riders. More Opportunities.</div>
              <div style={{ fontSize: 10.5, fontWeight: 500, color: '#5D6C65', marginTop: 2 }}>Help us grow our delivery network by onboarding more reliable riders.</div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                flex: 'none',
                height: 40,
                padding: '0 16px',
                border: 'none',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                fontSize: 12.5,
                fontWeight: 800,
                color: '#fff',
                cursor: 'pointer',
                background: `linear-gradient(100deg,#0BAE5E,${ACCENT})`,
                boxShadow: '0 8px 16px rgba(5,193,106,.26)',
              }}
            >
              <Link2 size={14} /> Generate Link
            </button>
          </div>

          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px 10px' }}>
              <div style={hdrIconStyle}>
                <BarChart3 size={15} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#10281C' }}>Quick Stats</div>
                <div style={{ fontSize: 10.5, fontWeight: 500, color: '#7C8A83', marginTop: 1 }}>Rider applications for the last 7 days</div>
              </div>
            </div>
            <div style={{ padding: '4px 15px 14px' }}>
              {(() => {
                const max = Math.max(1, ...weekly.map((w) => w.v));
                return (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 84 }}>
                    {weekly.map((w, i) => (
                      <div key={i} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                        <div
                          style={{
                            width: '100%',
                            height: Math.round((w.v / max) * 66) + 2,
                            borderRadius: '6px 6px 3px 3px',
                            background: `linear-gradient(180deg,#3ED68C,${ACCENT})`,
                          }}
                        />
                        <span style={{ fontSize: 8.5, fontWeight: 700, color: '#8A978F' }}>{w.d}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px 10px' }}>
              <div style={hdrIconStyle}>
                <Link2 size={19} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#10281C' }}>Rider Onboarding</div>
                <div style={{ fontSize: 10.5, fontWeight: 500, color: '#7C8A83', marginTop: 1 }}>Create a registration link to share with new riders.</div>
              </div>
            </div>
            <div style={{ padding: '4px 15px 14px', display: 'flex', flexDirection: 'column', gap: 11 }}>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  width: '100%',
                  height: 42,
                  border: 'none',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#fff',
                  cursor: 'pointer',
                  background: `linear-gradient(100deg,#0BAE5E,${ACCENT})`,
                  boxShadow: '0 8px 16px rgba(5,193,106,.26)',
                }}
              >
                <PlusCircle size={15} /> Generate Onboarding Link
              </button>

              <div style={{ padding: '11px 12px 10px', borderRadius: 12, background: '#F5F9F6', border: '1px solid #E7EEE9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <div style={{ width: 19, height: 19, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10.5, fontWeight: 800 }}>i</div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#2D4038' }}>How it works?</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {HOW_IT_WORKS.map((text, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ flex: 'none', width: 17, height: 17, borderRadius: '50%', background: ACCENT, color: '#fff', fontSize: 9.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 10, lineHeight: 1.3, fontWeight: 500, color: '#4E5D56' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddRiderModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}