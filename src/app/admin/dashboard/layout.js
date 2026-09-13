'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/admin');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0E2A1D, #173D28)', color: '#7FB89E' }}>
        Checking session...
      </div>
    );
  }

  const navItem = (href, label, Icon) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 10,
          color: active ? '#0E2A1D' : '#DCEFE3',
          background: active ? '#05C16A' : 'transparent',
          fontWeight: 600,
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        <Icon size={16} />
        {label}
      </Link>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0E2A1D, #173D28)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #2A4A38',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#05C16A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' }}>
            NTVS
          </div>
          <nav style={{ display: 'flex', gap: 8 }}>
            {navItem('/admin/dashboard', 'Dashboard', LayoutDashboard)}
            {navItem('/admin/dashboard/riders', 'Riders', Users)}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid #2A4A38',
            background: 'transparent',
            color: '#DCEFE3',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>

      {children}
    </div>
  );
}