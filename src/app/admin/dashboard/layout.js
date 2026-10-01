'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { LayoutDashboard, Users, Bell, ChevronDown, LogOut, Package, Menu, X, Phone, Mail, MapPin } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';

const CONTACT = {
  phones: ['+233 557 914 062', '+233 533 347 777'],
  email: 'noradinetopcash@gmail.com',
  address: 'Alajo Dk Poison Street, GA-095-9234',
};

export default function DashboardLayout({ children }) {
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 'admin' (default) or 'jumia_reviewer' — read from the Supabase Auth
  // user's own metadata, no separate roles table needed. A jumia_reviewer
  // account only ever sees the Jumia Delivery Reports nav item.
  const [role, setRole] = useState('admin');
  const router = useRouter();
  const pathname = usePathname();
  const isReviewer = role === 'jumia_reviewer';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/admin');
      } else {
        setRole(session.user?.user_metadata?.role || 'admin');
        setChecking(false);
      }
    });
  }, [router]);

  // Close the mobile drawer automatically whenever the route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // A jumia_reviewer landing on the main dashboard home (or the riders
  // section) gets sent straight to the Jumia Reports queue instead — those
  // nav links are hidden for them, but the routes themselves would still
  // render if visited directly.
  useEffect(() => {
    if (!isReviewer) return;
    if (pathname === '/admin/dashboard' || pathname.startsWith('/admin/dashboard/riders')) {
      router.replace('/admin/dashboard/jumia');
    }
  }, [isReviewer, pathname, router]);

  // Close the admin dropdown when tapping anywhere else on the screen
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'linear-gradient(180deg, #0B2418 0%, #0E2A1D 40%, #14432A 100%)', fontFamily: FONT }}>
        <img src="/logo.png" alt="NTVL" style={{ width: 64, height: 64, objectFit: 'contain', filter: 'drop-shadow(0 10px 22px rgba(0,0,0,.4))' }} />
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(255,255,255,.15)', borderTopColor: '#05C16A', animation: 'ntvl-spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)' }}>Checking session...</span>
        <style>{`@keyframes ntvl-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const navItem = (href, label, Icon) => {
    const active = href === '/admin/dashboard' ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 11,
          color: active ? '#06281A' : 'rgba(255,255,255,.82)',
          background: active ? ACCENT : 'transparent',
          fontWeight: 700,
          fontSize: 13.5,
          textDecoration: 'none',
          fontFamily: FONT,
        }}
      >
        <Icon size={17} />
        {label}
      </Link>
    );
  };

  const sidebarInner = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px 14px' }}>
        <img src="/logo.png" alt="NTVL" style={{ width: 32, height: 32, objectFit: 'contain', flex: 'none' }} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: '-.2px', whiteSpace: 'nowrap' }}>NTVL Delivery</span>
          <span style={{ fontSize: 9.5, fontWeight: 600, color: 'rgba(255,255,255,.62)' }}>Fast · Safe · Reliable</span>
        </div>
        <X
          size={20}
          color="rgba(255,255,255,.7)"
          onClick={() => setDrawerOpen(false)}
          className="ntvl-drawer-close-btn"
          style={{ marginLeft: 'auto', cursor: 'pointer', display: 'none' }}
        />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '6px 12px' }}>
        {!isReviewer && navItem('/admin/dashboard', 'Dashboard', LayoutDashboard)}
        {!isReviewer && navItem('/admin/dashboard/riders', 'Riders', Users)}
        {navItem('/admin/dashboard/jumia', 'Jumia Delivery Reports', Package)}
      </nav>

      <div style={{ flex: 1, minHeight: 20, overflowY: 'auto' }} />

      <img src="/sidebar-illustration.svg" alt="" style={{ width: '100%', display: 'block', flex: 'none' }} />

      <div style={{ padding: '12px 16px', background: '#0B2418', display: 'flex', flexDirection: 'column', gap: 8, flex: 'none' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.86)', lineHeight: 1.3, marginBottom: 2 }}>
          Building a stronger delivery network together
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-3z" stroke="#4FE39C" strokeWidth="1.9" strokeLinejoin="round" />
            <path d="M9 12.2l2.2 2.2 4-4.4" stroke="#4FE39C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.86)' }}>Safe Deliveries</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="8" r="3" stroke="#4FE39C" strokeWidth="1.9" />
            <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="#4FE39C" strokeWidth="1.9" strokeLinecap="round" />
            <circle cx="17" cy="9" r="2.4" stroke="#4FE39C" strokeWidth="1.7" />
            <path d="M15.5 20c0-2.6 1.8-4.5 4.5-4.5" stroke="#4FE39C" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.86)' }}>Stronger Communities</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 20V14M11 20V10M18 20V4" stroke="#4FE39C" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.86)' }}>A Better Tomorrow</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="ntvl-shell" style={{ minHeight: '100dvh', display: 'flex', fontFamily: FONT }}>
      {/* Mobile drawer overlay */}
      <div
        className={`ntvl-drawer-overlay ${drawerOpen ? 'ntvl-drawer-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Sidebar — pinned to the screen with position:fixed (via the CSS
          class, not inline, so the mobile media query can still override
          it for the slide-out drawer). Being truly "fixed" rather than
          "sticky" means it's taken out of the page's normal flow entirely
          — it never moves, never scrolls with the page, and never depends
          on any ancestor's height or overflow settings (which is what
          made the old sticky approach fragile). The main column below
          gets a matching margin-left on desktop so its content doesn't
          render underneath the fixed sidebar. */}
      <div
        className={`ntvl-sidebar-desktop ${drawerOpen ? 'ntvl-drawer-open' : ''}`}
        style={{
          background: 'linear-gradient(180deg, #0B2418 0%, #0E2A1D 40%, #14432A 100%)',
          color: '#fff',
        }}
      >
        {sidebarInner}
      </div>

      {/* Main column — the ntvl-main-column class adds margin-left on
          desktop to clear the fixed sidebar (0 on mobile, where the
          sidebar is an off-canvas drawer instead). No fixed height, no
          overflow trap: the page itself scrolls naturally; only the
          header is pinned (via sticky). */}
      <div className="ntvl-main-column" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#F7FBF8' }}>
        {/* Desktop topbar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            flex: 'none',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '0 20px',
            background: '#fff',
            borderBottom: '1px solid #E7ECE8',
          }}
        >
          {/* Mobile hamburger — only visible under 768px via CSS */}
          <div
            className="ntvl-mobile-topbar"
            onClick={() => setDrawerOpen(true)}
            style={{
              flex: 'none',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#F2F6F3',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Menu size={18} color="#31473C" />
          </div>

          <span className="ntvl-desktop-topbar-label" style={{ fontSize: 15.5, fontWeight: 800, color: '#12291F', letterSpacing: '-.3px' }}>
            NTVL Delivery
          </span>

          <div style={{ flex: 1 }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, cursor: 'pointer', flex: 'none' }}>
            <Bell size={20} color="#31473C" />
            <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#E5484D', border: '2px solid #fff' }} />
          </div>

          <div ref={menuRef} style={{ position: 'relative', flex: 'none' }}>
            <div onClick={() => setMenuOpen((s) => !s)} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(140deg,#0FB863,#059C51)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8.5" r="3.8" fill="#fff" />
                  <path d="M4.6 20.5c0-4 3.3-6.2 7.4-6.2s7.4 2.2 7.4 6.2" fill="#fff" />
                </svg>
              </div>
              <div className="ntvl-desktop-topbar-label" style={{ flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#12291F' }}>Admin</span>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#7C8A83' }}>System Administrator</span>
              </div>
              <ChevronDown size={14} color="#7C8A83" className="ntvl-desktop-topbar-label" />
            </div>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #E7ECE8',
                  boxShadow: '0 10px 26px rgba(18,41,31,.12)',
                  overflow: 'hidden',
                  zIndex: 10,
                  minWidth: 150,
                }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '11px 15px',
                    border: 'none',
                    background: 'none',
                    fontFamily: FONT,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#E5484D',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* flex:1 (no minHeight:0) makes this grow to fill any leftover
            space when a page's content is short — pushing the footer down
            to the bottom of the screen, same as before — while still
            letting it grow taller than the screen and scroll normally when
            a page's content is long (nothing here clips it, unlike the old
            fixed-100dvh-with-overflow-hidden approach). This single wrapper
            is what gives every page both behaviors at once. */}
        <div style={{ flex: 1 }}>
          {children}
        </div>

        {/* Footer — contact info, shown at the end of every dashboard page.
            Sits right after the content above: pinned to the bottom of the
            screen on a short page (via that flex:1 wrapper), and simply
            following the content on a long, scrolling page. */}
        <footer
          style={{
            padding: '9px 16px',
            background: '#fff',
            borderTop: '1px solid #E7ECE8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {/* Desktop: all four items on one row. Hidden below 768px via CSS class. */}
          <div
            className="ntvl-footer-full"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              rowGap: 4,
              columnGap: 18,
              width: '100%',
            }}
          >
            <a href={`tel:${CONTACT.phones[0].replace(/\s/g, '')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: '#5D6C65', textDecoration: 'none' }}>
              <Phone size={11} color="#8A978F" style={{ flex: 'none' }} /> {CONTACT.phones[0]}
            </a>
            <a href={`tel:${CONTACT.phones[1].replace(/\s/g, '')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: '#5D6C65', textDecoration: 'none' }}>
              <Phone size={11} color="#8A978F" style={{ flex: 'none' }} /> {CONTACT.phones[1]}
            </a>
            <a href={`mailto:${CONTACT.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: '#5D6C65', textDecoration: 'none' }}>
              <Mail size={11} color="#8A978F" style={{ flex: 'none' }} /> {CONTACT.email}
            </a>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: '#5D6C65' }}>
              <MapPin size={11} color="#8A978F" style={{ flex: 'none' }} /> {CONTACT.address}
            </span>
          </div>

          {/* Mobile: every item shown, each on its own deliberate line (no unpredictable wrapping). Hidden at 768px+ via CSS class. */}
          <div
            className="ntvl-footer-compact"
            style={{
              display: 'none',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              width: '100%',
            }}
          >
            <a href={`tel:${CONTACT.phones[0].replace(/\s/g, '')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#5D6C65', textDecoration: 'none' }}>
              <Phone size={10} color="#8A978F" style={{ flex: 'none' }} /> {CONTACT.phones[0]}
            </a>
            <a href={`tel:${CONTACT.phones[1].replace(/\s/g, '')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#5D6C65', textDecoration: 'none' }}>
              <Phone size={10} color="#8A978F" style={{ flex: 'none' }} /> {CONTACT.phones[1]}
            </a>
            <a href={`mailto:${CONTACT.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#5D6C65', textDecoration: 'none' }}>
              <Mail size={10} color="#8A978F" style={{ flex: 'none' }} /> {CONTACT.email}
            </a>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#5D6C65', textAlign: 'center' }}>
              <MapPin size={10} color="#8A978F" style={{ flex: 'none' }} /> {CONTACT.address}
            </span>
          </div>

          <span style={{ fontSize: 10, fontWeight: 500, color: '#B2BEB7', textAlign: 'center' }}>
            © {new Date().getFullYear()} Nouradine Top Cash Logistics. All rights reserved.
          </span>
        </footer>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .ntvl-mobile-topbar { display: flex !important; }
          .ntvl-drawer-close-btn { display: block !important; }
          .ntvl-footer-full { display: none !important; }
          .ntvl-footer-compact { display: flex !important; }
        }
      `}</style>
    </div>
  );
}