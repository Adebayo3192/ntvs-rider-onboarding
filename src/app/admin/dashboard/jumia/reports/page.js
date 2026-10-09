'use client';

import { useEffect, useState } from 'react';
import { Search, Eye, X, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authedFetch } from '@/lib/authedFetch';

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const ACCENT = '#0FA45C';
const R_COLS = '1.3fr .85fr .5fr .55fr .85fr .95fr .85fr .75fr .8fr';

const card = { background: '#fff', borderRadius: 16, border: '1px solid #E7ECE8', boxShadow: '0 2px 10px rgba(18,41,31,.04)', overflow: 'hidden' };
const headCell = { fontSize: 11, fontWeight: 800, color: '#5D6C65', letterSpacing: '.2px' };
const dropdown = { flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, height: 38, padding: '0 12px', borderRadius: 11, background: '#fff', border: '1px solid #E2E9E4', fontSize: 12, fontWeight: 700, color: '#3A4C43', cursor: 'pointer', boxSizing: 'border-box' };

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function pillStyle(status) {
  return status === 'Settled'
    ? { display: 'inline-flex', alignSelf: 'center', padding: '4px 11px', borderRadius: 999, fontSize: 10.5, fontWeight: 800, color: '#04763F', background: '#DCF4E6', border: '1px solid #AEE4C6' }
    : { display: 'inline-flex', alignSelf: 'center', padding: '4px 11px', borderRadius: 999, fontSize: 10.5, fontWeight: 800, color: '#8A6408', background: '#FDF0D4', border: '1px solid #F3DDA6' };
}

// Separate from settlement status (pillStyle above). This is the Jumia
// office's sign-off on the day's numbers, not whether the rider's been paid.
function approvalPillStyle(status) {
  if (status === 'approved') {
    return { display: 'inline-flex', alignSelf: 'center', padding: '4px 11px', borderRadius: 999, fontSize: 10.5, fontWeight: 800, color: '#04763F', background: '#DCF4E6', border: '1px solid #AEE4C6' };
  }
  if (status === 'rejected') {
    return { display: 'inline-flex', alignSelf: 'center', padding: '4px 11px', borderRadius: 999, fontSize: 10.5, fontWeight: 800, color: '#C13239', background: '#FDE4E6', border: '1px solid #F6C6C9' };
  }
  return { display: 'inline-flex', alignSelf: 'center', padding: '4px 11px', borderRadius: 999, fontSize: 10.5, fontWeight: 800, color: '#6E5A00', background: '#FBF3D6', border: '1px solid #EEDFA0' };
}

function approvalLabel(status) {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

function ReportDetailModal({ reportId, onClose, onChanged }) {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = () => {
    authedFetch(`/api/admin/jumia/reports/${reportId}`)
      .then((res) => res.json())
      .then(setReport);
  };

  useEffect(() => { load(); }, [reportId]);

  const submitDecision = async (approvalStatus, approvalNote) => {
    setActionError('');
    setSaving(true);
    const res = await authedFetch(`/api/admin/jumia/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus, approvalNote }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setActionError(data.error || 'Something went wrong. Please try again.');
      return;
    }
    setRejecting(false);
    setReason('');
    load();
    onChanged?.();
  };

  if (!report) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,40,28,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: 30, fontFamily: FONT, fontSize: 13, color: '#7C8A83' }}>Loading...</div>
      </div>
    );
  }

  const detailRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #F1F4F2' };
  const name = report.riders?.full_name || 'Rider';
  const approvalStatus = report.approval_status || 'pending';

  const rows = [
    { label: 'Date', value: new Date(report.report_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { label: 'Small Packages', value: `${report.small_count} × ₵${Number(report.small_price).toFixed(2)}` },
    { label: 'Medium Packages', value: `${report.medium_count} × ₵${Number(report.medium_price).toFixed(2)}` },
    { label: 'Total Amount', value: `₵${Number(report.total_amount).toFixed(2)}`, strong: true },
    { label: 'Settlement', value: report.settled ? 'Settled' : 'Unsettled', amber: !report.settled },
  ];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,40,28,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 2000, fontFamily: FONT }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '100%', padding: '20px 22px 22px', boxSizing: 'border-box', borderRadius: 18, background: '#fff', boxShadow: '0 30px 64px rgba(10,30,20,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ flex: 'none', width: 36, height: 36, borderRadius: 11, background: '#DCF4E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l8.5 4.3v9.4L12 21l-8.5-4.3V7.3L12 3z" stroke="#0FA45C" strokeWidth="1.9" strokeLinejoin="round" /><path d="M3.5 7.3L12 11.7l8.5-4.4M12 11.7V21" stroke="#0FA45C" strokeWidth="1.9" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 800, letterSpacing: '-.4px', color: '#10281C' }}>Delivery Report Details</span>
          <X size={17} color="#9AA8A0" style={{ cursor: 'pointer', flex: 'none' }} onClick={onClose} />
        </div>

        {/* Approval banner — the Jumia office's sign-off, separate from settlement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, padding: '10px 13px', borderRadius: 12, background: approvalStatus === 'approved' ? '#F3FAF6' : approvalStatus === 'rejected' ? '#FDF2F3' : '#FFFBF0', border: `1px solid ${approvalStatus === 'approved' ? '#DCEFE4' : approvalStatus === 'rejected' ? '#F6D6D8' : '#F1E6B8'}` }}>
          <span style={approvalPillStyle(approvalStatus)}>{approvalLabel(approvalStatus)}</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#5D6C65' }}>
            {approvalStatus === 'approved' && 'Signed off by the Jumia office — eligible for settlement.'}
            {approvalStatus === 'rejected' && (report.approval_note ? `Rejected: ${report.approval_note}` : 'Rejected by the Jumia office.')}
            {approvalStatus === 'pending' && 'Awaiting review from the Jumia office.'}
          </span>
        </div>

        <div className="ntvl-grid-2col-wide" style={{ marginTop: 16 }}>
          <div style={{ minWidth: 0, border: '1px solid #E7ECE8', borderRadius: 13, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#F7FBF8', borderBottom: '1px solid #EDF2EE' }}>
              <div style={{ flex: 'none', width: 36, height: 36, borderRadius: '50%', background: '#DCF4E6', color: '#04763F', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#10281C' }}>{name}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#7C8A83', marginTop: 1 }}>{report.riders?.phone}</div>
              </div>
            </div>
            <div style={{ padding: '2px 14px 6px' }}>
              {rows.map((d) => (
                <div key={d.label} style={detailRow}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#7C8A83' }}>{d.label}</span>
                  <span style={{ fontSize: d.strong ? 13.5 : 12.5, fontWeight: 800, color: d.amber ? '#8A6408' : '#10281C' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: 11, border: '1px solid #E7ECE8', borderRadius: 13, background: '#F7FBF8', boxSizing: 'border-box' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2D4038' }}>Delivery Screenshot</span>
            {report.signed_screenshot_url ? (
              <img src={report.signed_screenshot_url} alt="" style={{ width: '100%', flex: 1, minHeight: 180, borderRadius: 10, objectFit: 'cover', cursor: 'zoom-in' }} onClick={() => window.open(report.signed_screenshot_url, '_blank')} />
            ) : (
              <div style={{ flex: 1, minHeight: 180, borderRadius: 10, background: '#EDF1EE', border: '1px dashed #C9D4CD', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#8D9A93' }}>No screenshot uploaded</span>
              </div>
            )}
            {report.signed_screenshot_url && (
              <div onClick={() => window.open(report.signed_screenshot_url, '_blank')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 32, borderRadius: 9, background: '#fff', border: '1px solid #AEE4C6', cursor: 'pointer' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#04763F' }}>View Full Size</span>
              </div>
            )}
          </div>
        </div>

        {/* Approve / Reject — the Jumia-office reviewer's action */}
        {!rejecting ? (
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={() => setRejecting(true)}
              disabled={saving}
              style={{ flex: 1, height: 44, borderRadius: 12, border: '1px solid #F3CFD2', background: '#fff', fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#D4494E', cursor: saving ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            >
              <X size={15} /> Reject
            </button>
            <button
              onClick={() => submitDecision('approved', null)}
              disabled={saving || approvalStatus === 'approved'}
              style={{ flex: 1, height: 44, border: 'none', borderRadius: 12, cursor: saving || approvalStatus === 'approved' ? 'default' : 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: approvalStatus === 'approved' ? '#AEE4C6' : 'linear-gradient(100deg,#0BAE5E,#12C56E)', boxShadow: approvalStatus === 'approved' ? 'none' : '0 8px 18px rgba(5,193,106,.26)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            >
              <Check size={15} /> {approvalStatus === 'approved' ? 'Already Approved' : saving ? 'Approving...' : 'Approve'}
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 13, border: '1px solid #F6D6D8', background: '#FDF2F3' }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: '#C13239', marginBottom: 8 }}>Reason for rejection</div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. package counts don't match the screenshot"
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid #F3CFD2', fontFamily: FONT, fontSize: 12.5, color: '#10281C', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button
                onClick={() => { setRejecting(false); setReason(''); setActionError(''); }}
                disabled={saving}
                style={{ flex: 1, height: 40, borderRadius: 10, background: '#fff', border: '1px solid #E2E9E4', fontFamily: FONT, fontSize: 12.5, fontWeight: 800, color: '#3A4C43', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => submitDecision('rejected', reason)}
                disabled={saving || !reason.trim()}
                style={{ flex: 1, height: 40, border: 'none', borderRadius: 10, cursor: !reason.trim() || saving ? 'not-allowed' : 'pointer', fontFamily: FONT, fontSize: 12.5, fontWeight: 800, color: '#fff', background: reason.trim() ? '#E5484D' : '#F0B7BA' }}
              >
                {saving ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        )}

        {actionError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 11.5, fontWeight: 700, color: '#C13239' }}>
            <AlertCircle size={14} /> {actionError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 44, borderRadius: 12, background: '#F4F7F5', border: '1px solid #E2E9E4', fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#3A4C43', cursor: 'pointer' }}>
            Close
          </button>
          <button
            onClick={() => router.push(`/admin/dashboard/jumia/settlements?rider=${report.rider_id}`)}
            style={{ flex: 1.3, height: 44, border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(100deg,#0BAE5E,#12C56E)', boxShadow: '0 8px 18px rgba(5,193,106,.26)' }}
          >
            Open Settlement View
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, period });
    const res = await authedFetch(`/api/admin/jumia/reports?${params}`);
    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(fetchReports, 300);
    return () => clearTimeout(timeout);
  }, [search, period]);

  return (
    <div style={{ ...card, fontFamily: FONT }}>
      {/* header + rows below scroll together via ntvl-table-scroll on the outer card is not used here since search bar must stay fixed; wrap rows instead */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px 12px', borderBottom: '1px solid #F1F4F2', flexWrap: 'wrap' }}>
        <span style={{ flex: 'none', fontSize: 14, fontWeight: 800, color: '#10281C' }}>Recent Reports</span>
        <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 9, height: 38, padding: '0 12px', borderRadius: 11, background: '#F7FBF8', border: '1px solid #E2E9E4', boxSizing: 'border-box' }}>
          <Search size={14} color="#9AA8A0" style={{ flex: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by rider name..."
            style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: '#10281C', outline: 'none' }}
          />
        </div>
        <div style={dropdown} onClick={() => setPeriod(period === 'all' ? 'week' : 'all')}>
          <span>{period === 'all' ? 'All Time' : 'This Week'}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="#5D6C65" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>

      <div className="ntvl-table-scroll">
      <div className="ntvl-table-track" style={{ display: 'grid', gridTemplateColumns: R_COLS, gap: 10, padding: '10px 16px', background: '#F5F9F6', borderBottom: '1px solid #E7ECE8' }}>
        <span style={headCell}>Rider Name</span>
        <span style={headCell}>Date</span>
        <span style={headCell}>Small</span>
        <span style={headCell}>Medium</span>
        <span style={headCell}>Total Amount</span>
        <span style={headCell}>Approval</span>
        <span style={headCell}>Settlement</span>
        <span style={headCell}>Screenshot</span>
        <span style={headCell}>Actions</span>
      </div>

      {loading && <div style={{ padding: 18, textAlign: 'center', fontSize: 12.5, color: '#9AA8A0' }}>Loading...</div>}
      {!loading && reports.length === 0 && <div style={{ padding: 18, textAlign: 'center', fontSize: 12.5, color: '#9AA8A0' }}>No reports found.</div>}

      {!loading && reports.map((r) => (
        <div key={r.id} className="ntvl-table-track" style={{ display: 'grid', gridTemplateColumns: R_COLS, gap: 10, padding: '9px 16px', alignItems: 'center', borderBottom: '1px solid #F1F4F2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <div style={{ flex: 'none', width: 30, height: 30, borderRadius: '50%', background: '#DCF4E6', color: '#04763F', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {initials(r.name)}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1B332A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#3A4C43' }}>{new Date(r.date).toLocaleDateString()}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1B332A' }}>{r.small}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1B332A' }}>{r.medium}</span>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: '#10281C' }}>₵{Number(r.amount).toFixed(2)}</span>
          <span style={approvalPillStyle(r.approvalStatus)}>{approvalLabel(r.approvalStatus)}</span>
          <span style={pillStyle(r.status)}>{r.status}</span>
          <div style={{ width: 32, height: 38, borderRadius: 6, background: '#EDF1EE', border: '1px solid #DDE5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 7, fontWeight: 800, color: '#8D9A93', letterSpacing: '.4px' }}>VIEW</span>
          </div>
          <span
            onClick={() => setSelectedReport(r.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 11px', borderRadius: 9, background: '#fff', border: '1px solid #DCE6E0', fontSize: 11, fontWeight: 800, color: '#2D4038', cursor: 'pointer' }}
          >
            <Eye size={12} color="#0FA45C" /> View
          </span>
        </div>
      ))}
      </div>

      {selectedReport && (
        <ReportDetailModal reportId={selectedReport} onClose={() => setSelectedReport(null)} onChanged={fetchReports} />
      )}
    </div>
  );
}