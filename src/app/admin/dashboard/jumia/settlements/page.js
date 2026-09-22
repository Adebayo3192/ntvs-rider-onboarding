'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';
const SET_COLS = '34px 1.1fr .6fr .7fr 1fr';

const card = { background: '#fff', borderRadius: 16, border: '1px solid #E7ECE8', boxShadow: '0 2px 10px rgba(18,41,31,.04)', overflow: 'hidden' };
const headCell = { fontSize: 11, fontWeight: 800, color: '#5D6C65', letterSpacing: '.2px' };

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function RiderPicker({ onSelect }) {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/jumia/settlements')
      .then((res) => res.json())
      .then((data) => {
        setRiders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <div style={card}>
      <div style={{ padding: '13px 16px', borderBottom: '1px solid #F1F4F2', fontSize: 14, fontWeight: 800, color: '#10281C' }}>
        Riders with Pending Settlement
      </div>
      {loading && <div style={{ padding: 18, textAlign: 'center', fontSize: 12.5, color: '#9AA8A0' }}>Loading...</div>}
      {!loading && riders.length === 0 && <div style={{ padding: 18, textAlign: 'center', fontSize: 12.5, color: '#9AA8A0' }}>No pending settlements — every rider is fully settled.</div>}
      {!loading && riders.map((r) => (
        <div
          key={r.riderId}
          onClick={() => onSelect(r.riderId)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #F1F4F2', cursor: 'pointer' }}
        >
          <div style={{ flex: 'none', width: 34, height: 34, borderRadius: '50%', background: '#DCF4E6', color: '#04763F', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {initials(r.name)}
          </div>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: '#1B332A' }}>{r.name}</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#8A6408' }}>{r.count} unsettled</span>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: '#10281C' }}>₵{r.total.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function SettleView({ riderId, onBack }) {
  const [rider, setRider] = useState(null);
  const [unsettled, setUnsettled] = useState([]);
  const [settled, setSettled] = useState([]);
  const [selected, setSelected] = useState({});
  const [showSettled, setShowSettled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/jumia/manage').then((r) => r.json()),
      fetch(`/api/admin/jumia/settlements?riderId=${riderId}`).then((r) => r.json()),
    ]).then(([riders, data]) => {
      const found = riders.find((r) => r.id === riderId);
      setRider(found);
      setUnsettled(data.unsettled || []);
      setSettled(data.settled || []);
      setSelected({});
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [riderId]);

  const toggle = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const selectedReports = unsettled.filter((u) => selected[u.id]);
  const selSum = selectedReports.reduce((sum, r) => sum + Number(r.total_amount), 0);

  const handleSettle = async () => {
    if (selectedReports.length === 0) return;
    setSettling(true);
    await fetch('/api/admin/jumia/settlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ riderId, reportIds: selectedReports.map((r) => r.id) }),
    });
    setSettling(false);
    load();
  };

  if (loading || !rider) {
    return <div style={{ fontSize: 13, color: '#9AA8A0', fontFamily: FONT }}>Loading...</div>;
  }

  return (
    <div style={{ ...card, padding: '18px 20px 20px', fontFamily: FONT }}>
      {/* table-scroll wraps the unsettled list below */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span onClick={onBack} style={{ fontSize: 12, fontWeight: 800, color: '#0A7C46', cursor: 'pointer' }}>← All Riders</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, padding: '11px 14px', borderRadius: 14, background: '#F7FBF8', border: '1px solid #E7ECE8' }}>
        <div style={{ flex: 'none', width: 38, height: 38, borderRadius: '50%', background: '#DCF4E6', color: '#04763F', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {initials(rider.name)}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#10281C' }}>{rider.name}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7C8A83', marginTop: 1 }}>{rider.phone}</div>
        </div>
      </div>

      <div style={{ marginTop: 18, fontSize: 12.5, fontWeight: 800, color: '#2D4038' }}>Unsettled Reports</div>
      <div style={{ marginTop: 9, border: '1px solid #E7ECE8', borderRadius: 14, overflow: 'hidden' }}>
      <div className="ntvl-table-scroll">
        <div className="ntvl-table-track" style={{ display: 'grid', gridTemplateColumns: SET_COLS, gap: 10, padding: '10px 14px', background: '#F5F9F6', borderBottom: '1px solid #E7ECE8' }}>
          <span></span>
          <span style={headCell}>Date</span>
          <span style={headCell}>Small</span>
          <span style={headCell}>Medium</span>
          <span style={{ ...headCell, textAlign: 'right' }}>Amount</span>
        </div>
        {unsettled.length === 0 && <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#9AA8A0' }}>No unsettled reports.</div>}
        {unsettled.map((u) => {
          const on = !!selected[u.id];
          return (
            <div key={u.id} onClick={() => toggle(u.id)} className="ntvl-table-track" style={{ display: 'grid', gridTemplateColumns: SET_COLS, gap: 10, padding: '11px 14px', alignItems: 'center', borderBottom: '1px solid #F1F4F2', cursor: 'pointer' }}>
              <span style={{ width: 19, height: 19, borderRadius: 6, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', background: on ? ACCENT : '#fff', border: `2px solid ${on ? ACCENT : '#C8D3CC'}` }}>
                {on ? '✓' : ''}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1B332A' }}>{new Date(u.report_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#3A4C43' }}>{u.small_count}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#3A4C43' }}>{u.medium_count}</span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#10281C', textAlign: 'right' }}>₵{Number(u.total_amount).toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, padding: '13px 16px', borderRadius: 14, background: selSum ? '#DCF4E6' : '#F4F7F5', border: `1px solid ${selSum ? '#AEE4C6' : '#E7ECE8'}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#6E7D76' }}>{selectedReports.length} day(s) selected</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.6px', color: '#10281C', marginTop: 1 }}>Total: ₵{selSum.toFixed(2)}</div>
        </div>
        <button
          onClick={handleSettle}
          disabled={selSum === 0 || settling}
          style={selSum
            ? { flex: 'none', height: 44, padding: '0 20px', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(100deg,#0BAE5E,#12C56E)', boxShadow: '0 8px 18px rgba(5,193,106,.28)' }
            : { flex: 'none', height: 44, padding: '0 20px', border: '1px solid #E2E9E4', borderRadius: 12, cursor: 'not-allowed', fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#B2BEB7', background: '#F4F7F5' }}
        >
          {settling ? 'Settling...' : 'Settle Selected Days'}
        </button>
      </div>

      <div style={{ marginTop: 14, border: '1px solid #EDF2EE', borderRadius: 14, background: '#F9FBFA', overflow: 'hidden' }}>
        <div onClick={() => setShowSettled((s) => !s)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', cursor: 'pointer' }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 800, color: '#7C8A83' }}>Settled Reports ({settled.length})</span>
          <ChevronDown size={15} color="#9AA8A0" style={{ transform: showSettled ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
        </div>
        {showSettled && (
          <div style={{ borderTop: '1px solid #EDF2EE' }}>
            {settled.map((s) => (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr .8fr', gap: 10, padding: '10px 14px', alignItems: 'center', borderBottom: '1px solid #F1F4F2' }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#A3B0A8' }}>{new Date(s.report_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#A3B0A8' }}>{s.small_count} small, {s.medium_count} medium</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#A3B0A8', textAlign: 'right' }}>₵{Number(s.total_amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettlementsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const riderParam = params.get('rider');
  const [selectedRider, setSelectedRider] = useState(riderParam || null);

  const handleSelect = (id) => {
    setSelectedRider(id);
    router.replace(`/admin/dashboard/jumia/settlements?rider=${id}`);
  };

  const handleBack = () => {
    setSelectedRider(null);
    router.replace('/admin/dashboard/jumia/settlements');
  };

  return selectedRider
    ? <SettleView riderId={selectedRider} onBack={handleBack} />
    : <RiderPicker onSelect={handleSelect} />;
}

export default function SettlementsPage() {
  return (
    <Suspense fallback={null}>
      <SettlementsContent />
    </Suspense>
  );
}