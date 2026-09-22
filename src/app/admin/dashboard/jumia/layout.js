'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';

const TABS = [
  { label: 'Overview', href: '/admin/dashboard/jumia/overview' },
  { label: 'Rider Performance', href: '/admin/dashboard/jumia/performance' },
  { label: 'Settlements', href: '/admin/dashboard/jumia/settlements' },
  { label: 'Earnings', href: '/admin/dashboard/jumia/earnings' },
  { label: 'Reports', href: '/admin/dashboard/jumia/reports' },
  { label: 'Manage Riders', href: '/admin/dashboard/jumia/manage' },
  { label: 'Pricing', href: '/admin/dashboard/jumia/pricing' },
];

export default function JumiaLayout({ children }) {
  const pathname = usePathname();

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px 14px 0', fontFamily: FONT }}>
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 'none', width: 40, height: 40, borderRadius: 13, background: '#DCF4E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l8.5 4.3v9.4L12 21l-8.5-4.3V7.3L12 3z" stroke={ACCENT} strokeWidth="1.9" strokeLinejoin="round" />
            <path d="M3.5 7.3L12 11.7l8.5-4.4M12 11.7V21" stroke={ACCENT} strokeWidth="1.9" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: '-.5px', color: '#10281C' }}>Jumia Delivery Reports</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 500, color: '#6E7D76' }}>Manage daily delivery submissions, settlements, and pricing for Jumia riders.</p>
        </div>
      </div>

      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 14, borderBottom: '1px solid #E3EAE5', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                flex: 'none',
                padding: '10px 14px',
                fontSize: 12.5,
                fontWeight: 800,
                color: active ? '#0A7C46' : '#7C8A83',
                textDecoration: 'none',
                cursor: 'pointer',
                borderBottom: active ? `3px solid ${ACCENT}` : '3px solid transparent',
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 0 20px' }}>
        {children}
      </div>
    </div>
  );
}