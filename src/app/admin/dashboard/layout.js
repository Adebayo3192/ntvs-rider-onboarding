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
  // Controls the loader's exit animation: once the real session check
  // finishes (checking -> false), the bike plays its ride-off animation
  // for a fixed duration, then the loader actually unmounts. This is a
  // visual transition tied to a real completion event, not an artificial
  // delay — the dashboard itself is already ready underneath it.
  const [loaderExiting, setLoaderExiting] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
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

  // Session check just finished — play the bike's ride-off exit (550ms),
  // then swap the loader out for the real dashboard.
  useEffect(() => {
    if (checking) return;
    setLoaderExiting(true);
    const t = setTimeout(() => setShowLoader(false), 550);
    return () => clearTimeout(t);
  }, [checking]);

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
    // Logging out ends the admin/reviewer session entirely, so send them
    // back to the public homepage — not the login screen — same as
    // leaving any site after signing out.
    router.push('/');
  };

  if (showLoader) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
          background: 'linear-gradient(180deg, #0B2418 0%, #0E2A1D 40%, #14432A 100%)',
          fontFamily: FONT,
          overflow: 'hidden',
        }}
      >
        <img
          src="/logo.png"
          alt="NTVL"
          style={{
            width: 56,
            height: 56,
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 22px rgba(0,0,0,.4))',
            opacity: loaderExiting ? 0 : 1,
            transition: 'opacity .25s ease',
          }}
        />

        {/* Riding track — the bike loops in place (wheels spinning, a
            slight bob) while the session check is in flight, then
            accelerates and rides off the right edge once it's done. */}
        <div className="ntvl-bike-track">
          <div className={`ntvl-bike-wrap${loaderExiting ? ' ntvl-bike-exit' : ''}`}>
            <svg width="110" height="64" viewBox="0 0 110 64" fill="none">
              {/* speed lines — only visible during the exit, suggesting acceleration */}
              <g className="ntvl-bike-speedlines" stroke="rgba(79,227,156,.55)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="-6" y1="28" x2="14" y2="28" />
                <line x1="-14" y1="38" x2="8" y2="38" />
                <line x1="-10" y1="48" x2="10" y2="48" />
              </g>
              {/* frame */}
              <path d="M27 48 L46 23 L66 48 M46 23 L55 48 M66 48 L80 27" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M24 46 L31 46" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M78 24 L86 22" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
              {/* rider */}
              <circle cx="56" cy="12" r="5.2" fill="#fff" />
              <path d="M56 17 L50 29 M56 17 L65 24" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
              {/* wheels */}
              <g className="ntvl-wheel" style={{ transformOrigin: '27px 48px' }}>
                <circle cx="27" cy="48" r="12" stroke="#4FE39C" strokeWidth="3" />
                <line x1="27" y1="38" x2="27" y2="58" stroke="#4FE39C" strokeWidth="1.4" />
                <line x1="17" y1="48" x2="37" y2="48" stroke="#4FE39C" strokeWidth="1.4" />
              </g>
              <g className="ntvl-wheel" style={{ transformOrigin: '80px 48px' }}>
                <circle cx="80" cy="48" r="12" stroke="#4FE39C" strokeWidth="3" />
                <line x1="80" y1="38" x2="80" y2="58" stroke="#4FE39C" strokeWidth="1.4" />
                <line x1="70" y1="48" x2="90" y2="48" stroke="#4FE39C" strokeWidth="1.4" />
              </g>
            </svg>
          </div>
        </div>

        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(255,255,255,.6)',
            opacity: loaderExiting ? 0 : 1,
            transition: 'opacity .2s ease',
          }}
        >
          Checking session...
        </span>

        <style>{`
          .ntvl-bike-track {
            width: 100%;
            max-width: 220px;
            overflow: hidden;
            position: relative;
            height: 64px;
          }
          .ntvl-bike-wrap {
            width: 110px;
            margin: 0 auto;
            animation: ntvl-bike-bob 0.9s ease-in-out infinite;
          }
          .ntvl-bike-wrap .ntvl-wheel {
            animation: ntvl-wheel-spin 0.6s linear infinite;
          }
          .ntvl-bike-wrap .ntvl-bike-speedlines {
            opacity: 0;
            transition: opacity .15s ease;
          }
          @keyframes ntvl-bike-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes ntvl-wheel-spin {
            to { transform: rotate(360deg); }
          }
          /* Exit: bike accelerates off the right edge of its track while
             the wheels spin faster and speed lines fade in behind it. */
          .ntvl-bike-wrap.ntvl-bike-exit {
            animation: ntvl-bike-rideoff 0.55s cubic-bezier(.55,0,1,.45) forwards;
          }
          .ntvl-bike-wrap.ntvl-bike-exit .ntvl-wheel {
            animation: ntvl-wheel-spin 0.15s linear infinite;
          }
          .ntvl-bike-wrap.ntvl-bike-exit .ntvl-bike-speedlines {
            opacity: 1;
          }
          @keyframes ntvl-bike-rideoff {
            0% { transform: translateX(0); }
            100% { transform: translateX(340px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .ntvl-bike-wrap, .ntvl-bike-wrap .ntvl-wheel, .ntvl-bike-wrap.ntvl-bike-exit {
              animation: none !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // Nav links now live in the white top bar instead of a dedicated
  // vertical sidebar — horizontal row on desktop, a small dropdown panel
  // on mobile (see below), matching the homepage's own nav treatment:
  // plain text links with a green underline/color for the active one,
  // not solid green pills.
  const navItem = (href, label, Icon, { mobile } = {}) => {
    const active = href === '/admin/dashboard' ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setDrawerOpen(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: mobile ? '10px 6px' : '4px 2px',
          color: active ? ACCENT : '#3A4C43',
          fontWeight: 700,
          fontSize: 13.5,
          textDecoration: 'none',
          fontFamily: FONT,
          borderBottom: mobile ? 'none' : `2px solid ${active ? ACCENT : 'transparent'}`,
        }}
      >
        <Icon size={16} />
        {label}
      </Link>
    );
  };

  return (
    <div className="ntvl-shell" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#F7FBF8' }}>
        {/* Top bar — logo, horizontal nav (desktop), notifications and the
            admin account menu. This is now the only navigation chrome;
            there is no separate sidebar. */}
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
          {/* Mobile hamburger — toggles the nav dropdown below; only
              visible under 768px via CSS. Icon swaps to an X when open,
              same pattern as the homepage's mobile menu. */}
          <div
            className="ntvl-mobile-topbar"
            onClick={() => setDrawerOpen((s) => !s)}
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
            {drawerOpen ? <X size={18} color="#31473C" /> : <Menu size={18} color="#31473C" />}
          </div>

          {/* Logo doubles as "back to the public site" — clicking it from
              anywhere in the dashboard takes you off the admin shell
              entirely. Now lives in the top bar since there's no sidebar
              to hold it. */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flex: 'none' }}>
            <img src="/logo.png" alt="NTVL" style={{ width: 30, height: 30, objectFit: 'contain' }} />
            <span className="ntvl-desktop-topbar-label" style={{ fontSize: 15.5, fontWeight: 800, color: '#12291F', letterSpacing: '-.3px' }}>
              NTVL Delivery
            </span>
          </Link>

          {/* Horizontal nav — desktop only (hidden under 768px via the
              existing ntvl-desktop-topbar-label class). */}
          <nav className="ntvl-desktop-topbar-label" style={{ alignItems: 'center', gap: 22, marginLeft: 26 }}>
            {!isReviewer && navItem('/admin/dashboard', 'Dashboard', LayoutDashboard)}
            {!isReviewer && navItem('/admin/dashboard/riders', 'Riders', Users)}
            {navItem('/admin/dashboard/jumia', 'Jumia Delivery Reports', Package)}
          </nav>

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

        {/* Mobile nav dropdown — only ever mounted via the hamburger
            above, which only exists under 768px, so this never shows on
            desktop. Floats over the page content rather than pushing it
            down, closes itself on navigation (see the pathname effect
            above) or by tapping the hamburger again. */}
        {drawerOpen && (
          <div
            style={{
              position: 'fixed',
              top: 64,
              left: 0,
              right: 0,
              zIndex: 39,
              background: '#fff',
              borderBottom: '1px solid #E7ECE8',
              boxShadow: '0 14px 28px rgba(18,41,31,.1)',
              display: 'flex',
              flexDirection: 'column',
              padding: '6px 18px 12px',
            }}
          >
            {!isReviewer && navItem('/admin/dashboard', 'Dashboard', LayoutDashboard, { mobile: true })}
            {!isReviewer && navItem('/admin/dashboard/riders', 'Riders', Users, { mobile: true })}
            {navItem('/admin/dashboard/jumia', 'Jumia Delivery Reports', Package, { mobile: true })}
          </div>
        )}

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
          .ntvl-footer-full { display: none !important; }
          .ntvl-footer-compact { display: flex !important; }
        }
      `}</style>
    </div>
  );
}