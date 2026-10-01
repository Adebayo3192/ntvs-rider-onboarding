'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package, Users, Store, Zap, CheckCircle, Shield, Eye, ShieldCheck,
  PhoneCall, Link2, IdCard, Bike, Phone, Mail, MapPin,
  Menu, X, LogIn,
} from 'lucide-react';

// lucide-react dropped brand/logo icons (Facebook, Instagram, etc.) in
// newer versions over trademark concerns, so the footer's social icons
// are drawn here as plain inline SVGs instead of imported from the library.
const SOCIAL_ICONS = {
  facebook: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.5c0-.87.24-1.46 1.5-1.46h1.6V4.36A21 21 0 0 0 14.3 4.2c-2.2 0-3.7 1.34-3.7 3.8V10.5H8.1v3h2.5V21h2.9z"/></svg>
  ),
  twitter: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18.9 3h3l-6.6 7.5L23 21h-6.1l-4.8-6.3L6.6 21H3.5l7-8L2.6 3h6.3l4.3 5.8L18.9 3z"/></svg>
  ),
  instagram: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>
  ),
  linkedin: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3.5 9h3v11.5h-3V9zm6.4 0h2.9v1.6h.04c.4-.76 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.7v6.8h-3v-6c0-1.44-.03-3.3-2-3.3-2.02 0-2.33 1.58-2.33 3.2v6.1h-3V9z"/></svg>
  ),
  youtube: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22 12s0-3.2-.4-4.7a2.9 2.9 0 0 0-2-2C17.9 5 12 5 12 5s-5.9 0-7.6.3a2.9 2.9 0 0 0-2 2C2 8.8 2 12 2 12s0 3.2.4 4.7c.2 1 1 1.8 2 2C6.1 19 12 19 12 19s5.9 0 7.6-.3a2.9 2.9 0 0 0 2-2C22 15.2 22 12 22 12z"/><path d="M10 15.3V8.7L15.8 12 10 15.3z" fill="#0B2418"/></svg>
  ),
};

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";
const ACCENT = '#0FA45C';
const DARK = '#0B2418';

// Jumia Delivery Reports genuinely IS one shared public link — any
// onboarded rider can use it by picking their name from a list and
// entering their own 4-digit PIN, no per-person token needed.
const JUMIA_REPORTS_ROUTE = '/jumia';

// The one shared login page — both the admin account and the Jumia
// reviewer account sign in here; the dashboard itself decides what to
// show each of them based on their role (already built).
const LOGIN_ROUTE = '/admin';

const CONTACT = {
  phones: ['+233 557 914 062', '+233 533 347 777'],
  email: 'noradinetopcash@gmail.com',
  address: 'Alajo Dk Poison Street, GA-095-9234',
};

// There's no open "anyone can apply" form — each rider's application link
// is a unique, admin-generated token sent to them individually after they
// call in. So this page never links directly into the onboarding form;
// every "apply" CTA here is a phone call instead.
const PRIMARY_PHONE = CONTACT.phones[0];

const NAV = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About Us' },
  { href: '#services', label: 'Our Services' },
  { href: '#become-a-rider', label: 'Become a Rider' },
  { href: '#contact', label: 'Contact Us' },
];

const card = { background: '#fff', borderRadius: 18, border: '1px solid #E7ECE8', padding: 22 };
const btnPrimary = { display: 'inline-flex', alignItems: 'center', gap: 8, height: 46, padding: '0 22px', borderRadius: 12, border: 'none', background: `linear-gradient(100deg,#0BAE5E,#12C56E)`, color: '#fff', fontFamily: FONT, fontSize: 14, fontWeight: 800, cursor: 'pointer', textDecoration: 'none', boxShadow: '0 10px 22px rgba(5,193,106,.28)' };
const btnOutline = { display: 'inline-flex', alignItems: 'center', gap: 8, height: 46, padding: '0 22px', borderRadius: 12, border: '1.5px solid #CFE3D7', background: 'transparent', color: DARK, fontFamily: FONT, fontSize: 14, fontWeight: 800, cursor: 'pointer', textDecoration: 'none' };
const btnOutlineOnDark = { ...btnOutline, border: '1.5px solid rgba(255,255,255,.4)', color: '#fff' };

const SERVICES = [
  { icon: Package, title: 'Package Delivery', desc: 'Fast and secure delivery of packages across Ghana.' },
  { icon: Bike, title: 'Rider Network', desc: 'A trusted network of verified riders for efficient deliveries.' },
  { icon: Store, title: 'Business Solutions', desc: 'Delivery support for businesses of all sizes.' },
];

const WHY = [
  { icon: Zap, title: 'Fast', desc: 'Quick and efficient deliveries.' },
  { icon: CheckCircle, title: 'Reliable', desc: 'You can count on us.' },
  { icon: Shield, title: 'Secure', desc: 'Your packages are in safe hands.' },
  { icon: Eye, title: 'Transparent', desc: 'Clear communication every step of the way.' },
];

const STEPS = [
  { icon: PhoneCall, title: 'Call Us', desc: 'Reach out by phone to tell us you’re interested in becoming a rider.' },
  { icon: Link2, title: 'Get Your Link', desc: 'Our team sends you a personal application link by phone or WhatsApp.' },
  { icon: IdCard, title: 'Submit Your Details', desc: 'Personal info, ID/photo uploads, and guarantor information.' },
  { icon: Bike, title: 'Get Approved & Start Earning', desc: 'Once approved, begin making deliveries and tracking your daily earnings.' },
];

const PERKS = [
  'Flexible earning opportunities',
  'Be part of a growing network',
  'Make a positive impact',
  'Support your community',
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: FONT, color: DARK, background: '#fff' }}>
      {/* ===================== HEADER ===================== */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #EDF2EE' }}>
        <div className="ntvl-pub-wrap" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px' }}>
          <img src="/logo.png" alt="NTVL" style={{ width: 42, height: 42, objectFit: 'contain', flex: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-.2px' }}>NOURADINE<br />TOP CASH LOGISTICS</span>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: '#7C8A83' }}>Fast and Reliable</span>
          </div>

          <nav className="ntvl-pub-nav" style={{ display: 'flex', alignItems: 'center', gap: 26, marginLeft: 36 }}>
            {NAV.map((n) => (
              <a key={n.href} href={n.href} style={{ fontSize: 13.5, fontWeight: 700, color: n.href === '#home' ? ACCENT : '#3A4C43', textDecoration: 'none' }}>
                {n.label}
              </a>
            ))}
          </nav>

          <div style={{ flex: 1 }} />

          <Link href={JUMIA_REPORTS_ROUTE} className="ntvl-pub-desktop-only" style={btnOutline}>
            Jumia Delivery Reports
          </Link>
          <Link href={LOGIN_ROUTE} className="ntvl-pub-desktop-only" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 800, color: '#3A4C43', textDecoration: 'none' }}>
            <LogIn size={15} /> Login
          </Link>

          <div
            className="ntvl-pub-hamburger"
            onClick={() => setMenuOpen((s) => !s)}
            style={{ display: 'none', width: 40, height: 40, borderRadius: 10, background: '#F2F6F3', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {menuOpen ? <X size={20} color={DARK} /> : <Menu size={20} color={DARK} />}
          </div>
        </div>

        {menuOpen && (
          <div className="ntvl-pub-mobile-menu" style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 20px 16px', borderTop: '1px solid #EDF2EE' }}>
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} style={{ padding: '10px 4px', fontSize: 14, fontWeight: 700, color: '#3A4C43', textDecoration: 'none' }}>
                {n.label}
              </a>
            ))}
            <Link href={JUMIA_REPORTS_ROUTE} style={{ ...btnOutline, marginTop: 10, justifyContent: 'center' }}>Jumia Delivery Reports</Link>
            <Link href={LOGIN_ROUTE} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, padding: '10px 4px', fontSize: 14, fontWeight: 800, color: '#3A4C43', textDecoration: 'none' }}>
              <LogIn size={15} /> Login
            </Link>
          </div>
        )}
      </header>

      {/* ===================== HERO ===================== */}
      {/* Full-bleed photo as the section background, faded into the page's
          own light background on the left (via the white-to-transparent
          gradient below) so the text sits directly on the fade instead of
          floating in a separate boxed-off photo card. */}
      <section id="home" className="ntvl-pub-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src="/hero-rider.jpg"
          alt="NTVL rider on a delivery motorcycle in Accra"
          className="ntvl-pub-hero-photo"
        />
        {/* Fade: opaque page-background color on the left (where the text
            sits), fully transparent by the right third (where the rider is
            fully visible). On mobile this is hidden — see the media query
            below, where the photo becomes a plain stacked banner instead,
            since there isn't enough width for a fade to read correctly. */}
        <div className="ntvl-pub-hero-fade-h" />
        {/* Soft bottom fade so the page below meets the photo cleanly */}
        <div className="ntvl-pub-hero-fade-v" />

        <span className="ntvl-pub-hero-tag">
          Delivering a<br />Better Tomorrow
        </span>

        <div className="ntvl-pub-wrap ntvl-pub-hero-content" style={{ position: 'relative' }}>
          <div className="ntvl-pub-hero-text" style={{ maxWidth: 560 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: ACCENT, letterSpacing: '.6px' }}>WELCOME TO NTVL</span>
            <h1 style={{ margin: '10px 0 16px', fontSize: 44, lineHeight: 1.08, fontWeight: 800, letterSpacing: '-1px' }}>
              Fast, Safe &amp;<br /><span style={{ color: ACCENT }}>Reliable Delivery</span>
            </h1>
            <p style={{ margin: '0 0 24px', fontSize: 15.5, lineHeight: 1.6, color: '#5D6C65', maxWidth: 480 }}>
              Nouradine Top Cash Logistics (NTVL) connects people, businesses and communities with reliable delivery solutions across Ghana.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={`tel:${PRIMARY_PHONE.replace(/\s/g, '')}`} style={btnPrimary}>
                <PhoneCall size={16} /> Call to Become a Rider
              </a>
              <Link href={JUMIA_REPORTS_ROUTE} style={btnOutline}>Jumia Delivery Reports</Link>
            </div>

            <div style={{ display: 'flex', gap: 26, marginTop: 30, flexWrap: 'wrap' }}>
              {[
                { icon: ShieldCheck, label: 'Safe Deliveries' },
                { icon: Users, label: 'Stronger Communities' },
                { icon: Zap, label: 'A Better Tomorrow' },
              ].map((b) => (
                <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#DCF4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                    <b.icon size={16} color={ACCENT} />
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#3A4C43' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== WHAT WE DO / WHY CHOOSE ===================== */}
      <section id="services" style={{ padding: '50px 24px' }}>
        <div className="ntvl-pub-wrap ntvl-pub-services-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 30 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 800, color: ACCENT, letterSpacing: '.6px' }}>OUR SERVICES</span>
            <h2 style={{ margin: '8px 0 6px', fontSize: 27, fontWeight: 800, letterSpacing: '-.4px' }}>What We Do</h2>
            <p style={{ margin: '0 0 22px', fontSize: 13.5, color: '#7C8A83' }}>Reliable delivery solutions for individuals, businesses and communities.</p>

            <div className="ntvl-pub-service-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {SERVICES.map((s) => (
                <div key={s.title} style={card}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#DCF4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <s.icon size={20} color={ACCENT} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#7C8A83', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="about" style={{ background: '#F3FAF6', borderRadius: 20, padding: 26 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: ACCENT, letterSpacing: '.6px' }}>WHY CHOOSE NTVL</span>
            <h2 style={{ margin: '8px 0 6px', fontSize: 22, fontWeight: 800, letterSpacing: '-.4px' }}>More Than Deliveries</h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#5D6C65', lineHeight: 1.5 }}>
              We are committed to building a stronger delivery network through trust, technology and people.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {WHY.map((w) => (
                <div key={w.title} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <w.icon size={17} color={ACCENT} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{w.title}</div>
                  <div style={{ fontSize: 11.5, color: '#7C8A83', lineHeight: 1.4 }}>{w.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW TO BECOME A RIDER ===================== */}
      <section style={{ padding: '10px 24px 50px' }}>
        <div className="ntvl-pub-wrap">
          <span style={{ fontSize: 12, fontWeight: 800, color: ACCENT, letterSpacing: '.6px' }}>HOW TO BECOME A RIDER</span>
          <h2 style={{ margin: '8px 0 6px', fontSize: 27, fontWeight: 800, letterSpacing: '-.4px' }}>Join Our Rider Network</h2>
          <p style={{ margin: '0 0 28px', fontSize: 13.5, color: '#7C8A83' }}>Follow these simple steps to start your journey with NTVL.</p>

          <div className="ntvl-pub-steps" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {STEPS.map((s, i) => (
              <div key={s.title} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: ACCENT, color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                    {i + 1}
                  </div>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#F3FAF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={19} color={ACCENT} />
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#7C8A83', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== BECOME A RIDER BANNER ===================== */}
      <section id="become-a-rider" style={{ padding: '0 24px 56px' }}>
        <div className="ntvl-pub-wrap ntvl-pub-banner" style={{ borderRadius: 24, background: `linear-gradient(110deg, ${DARK} 0%, #14432A 100%)`, padding: '40px 36px', display: 'grid', gridTemplateColumns: '.8fr 1.2fr', gap: 36, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 150, height: 150, borderRadius: 32, background: 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bike size={70} color="#4FE39C" />
            </div>
          </div>
          <div>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#4FE39C', letterSpacing: '.6px' }}>BECOME A RIDER</span>
            <h2 style={{ margin: '8px 0 8px', fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-.4px' }}>Join the NTVL Rider Network</h2>
            <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'rgba(255,255,255,.75)', maxWidth: 420 }}>
              Earn, grow and be part of a trusted delivery community. Give us a call and our team will get you started.
            </p>
            <div className="ntvl-pub-perks" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
              {PERKS.map((p) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={15} color="#4FE39C" style={{ flex: 'none' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.88)' }}>{p}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {CONTACT.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s/g, '')}`} style={btnPrimary}>
                  <PhoneCall size={16} /> {p}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer id="contact" style={{ background: DARK, color: 'rgba(255,255,255,.85)', padding: '44px 24px 24px' }}>
        <div className="ntvl-pub-wrap ntvl-pub-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: 30 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <img src="/logo.png" alt="NTVL" style={{ width: 32, height: 32, objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: '#fff' }}>NOURADINE TOP CASH LOGISTICS</div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.55)' }}>Fast and Reliable</div>
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 14 }}>
              © {new Date().getFullYear()} Nouradine Top Cash Logistics (NTVL). All rights reserved.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Quick Links</div>
            {NAV.map((n) => (
              <a key={n.href} href={n.href} style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,.65)', textDecoration: 'none', marginBottom: 8 }}>{n.label}</a>
            ))}
            <Link href={JUMIA_REPORTS_ROUTE} style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,.65)', textDecoration: 'none', marginBottom: 8 }}>Jumia Delivery Reports</Link>
            <Link href={LOGIN_ROUTE} style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,.65)', textDecoration: 'none' }}>Login</Link>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Our Services</div>
            {SERVICES.map((s) => (
              <span key={s.title} style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,.65)', marginBottom: 8 }}>{s.title}</span>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Contact Us</div>
            <a href={`tel:${CONTACT.phones[0].replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,.65)', textDecoration: 'none', marginBottom: 8 }}>
              <Phone size={12} /> {CONTACT.phones[0]}
            </a>
            <a href={`mailto:${CONTACT.email}`} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,.65)', textDecoration: 'none', marginBottom: 8 }}>
              <Mail size={12} /> {CONTACT.email}
            </a>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,.65)' }}>
              <MapPin size={12} /> {CONTACT.address}
            </span>

            {/* TODO: replace '#' with real social URLs once known */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {Object.entries(SOCIAL_ICONS).map(([key, Icon]) => (
                <a key={key} href="#" style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Icon width={13} height={13} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', marginTop: 30, paddingTop: 16, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Privacy Policy &nbsp;|&nbsp; Terms of Service</span>
        </div>
      </footer>

      <style>{`
        .ntvl-pub-wrap { max-width: 1180px; margin: 0 auto; }

        /* Hero photo + fades — desktop/default: full-bleed background photo
           with a left-to-right fade into the page color behind the text. */
        .ntvl-pub-hero { min-height: 420px; }
        .ntvl-pub-hero-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .ntvl-pub-hero-fade-h { position: absolute; inset: 0; background: linear-gradient(90deg, #F3FAF6 0%, #F3FAF6 28%, rgba(243,250,246,.75) 42%, rgba(243,250,246,0) 62%); }
        .ntvl-pub-hero-fade-v { position: absolute; inset: 0; background: linear-gradient(0deg, #fff 0%, rgba(255,255,255,0) 22%); }
        .ntvl-pub-hero-tag {
          position: absolute; top: 28px; right: 32px; font-family: 'Caveat', cursive; font-size: 24px; font-weight: 600;
          color: ${DARK}; transform: rotate(-4deg); text-align: right; line-height: 1.2;
        }
        .ntvl-pub-hero-content { padding: 64px 24px 48px; }
        .ntvl-pub-hero-text { max-width: 560px; }

        @media (max-width: 900px) {
          .ntvl-pub-nav { display: none !important; }
          .ntvl-pub-desktop-only { display: none !important; }
          .ntvl-pub-hamburger { display: flex !important; }
          .ntvl-pub-services-grid { grid-template-columns: 1fr !important; }
          .ntvl-pub-service-cards { grid-template-columns: 1fr !important; }
          .ntvl-pub-steps { grid-template-columns: 1fr 1fr !important; }
          .ntvl-pub-banner { grid-template-columns: 1fr !important; }
          .ntvl-pub-perks { grid-template-columns: 1fr !important; }
          .ntvl-pub-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }

        /* Hero on mobile: the fade needs real width to read correctly, so
           below 700px the photo instead becomes a plain stacked banner on
           top, with the text in normal flow underneath it on a solid
           background — no overlap, no fade. */
        @media (max-width: 700px) {
          .ntvl-pub-hero { min-height: unset; }
          .ntvl-pub-hero-photo { position: static; display: block; width: 100%; height: 200px; object-fit: cover; }
          .ntvl-pub-hero-fade-h { display: none; }
          .ntvl-pub-hero-fade-v { position: absolute; inset: auto 0 0 0; height: 50px; }
          .ntvl-pub-hero-tag { top: 14px; right: 14px; font-size: 19px; }
          .ntvl-pub-hero-content { padding: 22px 20px 36px; }
          .ntvl-pub-hero-text { max-width: none; }
        }

        @media (max-width: 520px) {
          .ntvl-pub-steps { grid-template-columns: 1fr !important; }
          .ntvl-pub-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}