'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

// ============================================================
// Real site data — kept from the previous homepage, not from
// the Figma export (which used placeholder numbers/email/photo).
// ============================================================
const CONTACT = {
  phones: ['+233 557 914 062', '+233 533 347 777'],
  email: 'noradinetopcash@gmail.com',
  address: 'Alajo Dk Poison Street, GA-095-9234',
};
const PRIMARY_PHONE = CONTACT.phones[0];

// The one shared login page — both the admin account and the Jumia
// reviewer account sign in here; the dashboard decides what to show each
// of them based on role.
const LOGIN_ROUTE = '/admin';

const NAV = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About Us' },
  { href: '#services', label: 'Our Services' },
  { href: '#riders', label: 'Become a Rider' },
  { href: '#contact', label: 'Contact Us' },
];

// ============================================================
// Icon set (inline SVG, from the Figma export) — avoids pulling
// in lucide-react's brand icons, which were dropped upstream.
// ============================================================
function Icon({ name, size = 22 }) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    box: (
      <>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="m3 8 9 5 9-5v9l-9 5-9-5V8Z" />
        <path d="M12 13v9" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    facebook: <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.7.3-1 1-1Z" />,
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" />
        <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    login: (
      <>
        <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
        <path d="m10 17 5-5-5-5M15 12H3" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    phone: (
      <path d="M21 16.7v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.1 4 2 2 0 0 1 3.1 1.8h3a2 2 0 0 1 2 1.7c.1 1 .4 2.1.7 3a2 2 0 0 1-.4 2.1L7.1 10a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4c1 .4 2 .6 3 .7a2 2 0 0 1 1.4 1.8Z" />
    ),
    riders: (
      <>
        <circle cx="8" cy="7" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2 21v-2a6 6 0 0 1 12 0v2M14 15a5 5 0 0 1 8 4v2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 2 20 6v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    spark: <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" />,
    // X (formerly Twitter) — current wordmark-free logo, filled rather
    // than stroked like the other icons here since it reads better solid.
    x: (
      <path
        fill="currentColor"
        stroke="none"
        d="M17.53 3h3.2l-7 8 8.24 10.5h-6.45l-5.05-6.42L4.4 21.5H1.2l7.49-8.56L.77 3h6.61l4.57 5.83L17.53 3Zm-1.12 16.59h1.77L6.66 4.82H4.76l11.65 14.77Z"
      />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}

function Logo({ light = false }) {
  return (
    <Link href="#home" className={`logo ${light ? 'logo--light' : ''}`} aria-label="NTVL home">
      <img src="/logo.png" alt="NTVL" className="logo__img" />
      <span className="logo__copy">
        <strong>NOURADINE TOP CASH LOGISTICS</strong>
        <small>Fast and Reliable</small>
      </span>
    </Link>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

const services = [
  { icon: 'box', number: '01', title: 'Package Delivery', text: 'Careful, dependable delivery that gets packages where they need to go, on time.' },
  { icon: 'riders', number: '02', title: 'Rider Network', text: 'A trusted community of trained riders connecting businesses and people across Accra.' },
  { icon: 'briefcase', number: '03', title: 'Business Solutions', text: 'Flexible logistics support built around the day-to-day needs of growing businesses.' },
];

const reasons = [
  { icon: 'clock', title: 'Fast', text: 'Prompt delivery, every time.' },
  { icon: 'shield', title: 'Reliable', text: 'People you can count on.' },
  { icon: 'lock', title: 'Secure', text: 'Every package handled with care.' },
  { icon: 'eye', title: 'Transparent', text: 'Clear updates from start to finish.' },
];

const steps = [
  { icon: 'phone', title: 'Call Us', text: 'Speak directly with our rider team.' },
  { icon: 'link', title: 'Get Your Link', text: 'We send your personal onboarding link.' },
  { icon: 'riders', title: 'Submit Your Details', text: 'Complete and send your information.' },
  { icon: 'check', title: 'Get Approved & Start Earning', text: 'Join the network and get on the road.' },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="header">
        <div className="container header__inner">
          <Logo />

          <nav className="nav" aria-label="Main navigation">
            {NAV.map((n) => (
              <a key={n.href} className={n.href === '#home' ? 'active' : ''} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>

          <div className="header__actions">
            <Link className="login-link" href={LOGIN_ROUTE}>
              <Icon name="login" size={18} /> Login
            </Link>
          </div>

          <button
            type="button"
            className="hamburger"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((s) => !s)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
                {n.label}
              </a>
            ))}
            <Link href={LOGIN_ROUTE} onClick={() => setMenuOpen(false)}>
              <Icon name="login" size={16} /> Login
            </Link>
          </div>
        )}
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero__image" aria-hidden="true">
            <img src="/hero-rider.jpg" alt="" />
            <div className="hero__photo-label">
              <span>Delivering a</span>
              <strong>Better Tomorrow</strong>
            </div>
          </div>
          <div className="container hero__layout">
            <div className="hero__content">
              <span className="eyebrow">WELCOME TO NTVL</span>
              <h1>
                Fast, Safe &amp;<br /><em>Reliable</em> Delivery
              </h1>
              <p>
                Nouradine Top Cash Logistics (NTVL) connects people, businesses and communities with
                reliable delivery solutions across Ghana.
              </p>
              <div className="hero__actions">
                <a className="button button--primary" href={`tel:${PRIMARY_PHONE.replace(/\s/g, '')}`}>
                  <Icon name="phone" size={19} /> Call to Become a Rider
                </a>
              </div>
              <div className="trust-row" aria-label="Our commitments">
                {[
                  ['shield', 'Safe Deliveries'],
                  ['riders', 'Stronger Communities'],
                  ['spark', 'A Better Tomorrow'],
                ].map(([icon, label]) => (
                  <div className="trust-item" key={label}>
                    <span><Icon name={icon} size={17} /></span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="services section" id="services">
          <div className="container">
            <div className="services__intro">
              <SectionHeading
                eyebrow="WHAT WE DO"
                title="Logistics that keeps life moving."
                description="Simple, dependable delivery services powered by people who know the city."
              />
              <p className="services__note">Proudly serving individuals, riders and businesses across Accra, Ghana.</p>
            </div>
            <div className="service-grid">
              {services.map((service) => (
                <article className="service-card" key={service.title}>
                  <div className="service-card__top">
                    <span className="icon-box"><Icon name={service.icon} size={25} /></span>
                    <span className="card-number">{service.number}</span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="why section" id="about">
          <div className="container">
            <SectionHeading eyebrow="WHY CHOOSE NTVL" title="Built on trust. Driven by care." />
            <div className="reason-grid">
              {reasons.map((reason) => (
                <article className="reason" key={reason.title}>
                  <span className="reason__icon"><Icon name={reason.icon} size={24} /></span>
                  <div><h3>{reason.title}</h3><p>{reason.text}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process section" id="riders">
          <div className="container">
            <div className="process__heading">
              <SectionHeading
                eyebrow="JOIN OUR RIDER NETWORK"
                title="Your road to earning starts here."
                description="No long forms or complicated sign-up. Give us a call and our team will guide you through each step."
              />
              <a className="text-link" href={`tel:${PRIMARY_PHONE.replace(/\s/g, '')}`}>
                Speak with our team <Icon name="arrow" size={18} />
              </a>
            </div>
            <div className="steps">
              {steps.map((step, index) => (
                <article className="step" key={step.title}>
                  <div className="step__marker">
                    <span><Icon name={step.icon} size={23} /></span>
                    {index < steps.length - 1 && <i />}
                  </div>
                  <small>STEP {index + 1}</small>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rider-banner">
          <div className="rider-banner__texture" />
          <div className="container rider-banner__inner">
            <div className="rider-banner__copy">
              <span className="eyebrow eyebrow--light">BECOME A RIDER</span>
              <h2>Join the NTVL<br />Rider Network.</h2>
              <p>Earn on your schedule, grow with a trusted network and make a positive impact in your community.</p>
            </div>
            <div className="perks">
              {['Flexible earning', 'Growing network', 'Positive impact', 'Community support'].map((perk) => (
                <div key={perk}><span><Icon name="check" size={16} /></span>{perk}</div>
              ))}
            </div>
            <div className="call-panel">
              <small>CALL TO GET STARTED</small>
              {CONTACT.phones.map((phone) => (
                <a href={`tel:${phone.replace(/\s/g, '')}`} key={phone}>
                  <span><Icon name="phone" size={19} /></span>{phone}
                </a>
              ))}
              <p>Our team will send you a personal onboarding link after your call.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="contact">
        <div className="container footer__grid">
          <div className="footer__brand">
            <Logo light />
            <p>Fast and reliable delivery, building stronger communities across Accra.</p>
            <span>© {new Date().getFullYear()} Nouradine Top Cash Logistics (NTVL). All rights reserved.</span>
          </div>
          <div className="footer__column">
            <h3>Quick Links</h3>
            {NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
            <Link href={LOGIN_ROUTE}>Login</Link>
          </div>
          <div className="footer__column">
            <h3>Our Services</h3>
            {services.map((s) => <a key={s.title} href="#services">{s.title}</a>)}
          </div>
          <div className="footer__column footer__contact">
            <h3>Contact Us</h3>
            <a href={`tel:${CONTACT.phones[0].replace(/\s/g, '')}`}><Icon name="phone" size={17} />{CONTACT.phones[0]}</a>
            <a href={`mailto:${CONTACT.email}`}><Icon name="mail" size={17} />{CONTACT.email}</a>
            <span><Icon name="location" size={18} />{CONTACT.address}</span>
          </div>
          <div className="footer__column footer__social">
            <h3>Follow Us</h3>
            <p>Updates coming soon.</p>
            <div>
              <span aria-label="Facebook"><Icon name="facebook" size={17} /></span>
              <span aria-label="Instagram"><Icon name="instagram" size={17} /></span>
              <span aria-label="X"><Icon name="x" size={17} /></span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap");

        .site-shell {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #10231a;
          background: #fff;
          overflow: hidden;
        }
        .site-shell * { box-sizing: border-box; }
        .site-shell a { color: inherit; text-decoration: none; }
        .site-shell button, .site-shell a { -webkit-tap-highlight-color: transparent; }
        .container { width: min(1180px, calc(100% - 48px)); margin: 0 auto; }
        .section { padding: 112px 0; }

        .header {
          position: sticky;
          top: 0;
          z-index: 20;
          height: 92px;
          background: rgba(255, 255, 255, .96);
          border-bottom: 1px solid rgba(11, 36, 24, .09);
        }
        .header__inner { height: 100%; display: flex; align-items: center; justify-content: space-between; gap: 30px; }
        .logo { display: inline-flex; align-items: center; gap: 11px; flex-shrink: 0; }
        .logo__img { width: 44px; height: 44px; object-fit: contain; flex: none; }
        .logo__copy { display: flex; flex-direction: column; }
        .logo__copy strong { max-width: 170px; color: #0b2418; font-size: 10px; line-height: 1.3; letter-spacing: .09em; }
        .logo__copy small { color: #0fa45c; font-size: 10px; font-weight: 700; letter-spacing: .05em; margin-top: 3px; }
        .nav { display: flex; align-items: center; gap: 25px; margin-left: auto; }
        .nav a { position: relative; color: #526259; font-size: 12px; font-weight: 700; white-space: nowrap; transition: color .2s ease; }
        .nav a:hover, .nav a.active { color: #14432a; }
        .nav a.active::after { content: ""; position: absolute; left: 0; right: 0; bottom: -12px; height: 2px; background: #0fa45c; border-radius: 2px; }
        .header__actions { display: flex; align-items: center; gap: 18px; }
        .login-link { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; color: #14432a; }
        .hamburger {
          display: none; width: 40px; height: 40px; border-radius: 10px; border: none;
          background: #f2f6f3; color: #0b2418; align-items: center; justify-content: center; cursor: pointer;
        }
        .mobile-menu {
          position: relative;
          z-index: 25;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 4px 24px 18px;
          background: #fff; /* explicit, solid — never inherit/transparent, so the hero photo can't show through behind the text */
          border-top: 1px solid #edf2ee;
        }
        .mobile-menu a { padding: 10px 4px; font-size: 14px; font-weight: 700; color: #3a4c43; display: flex; align-items: center; gap: 6px; }

        .button {
          min-height: 51px; display: inline-flex; align-items: center; justify-content: center; gap: 9px;
          padding: 0 22px; border-radius: 6px; font-size: 12px; font-weight: 800; letter-spacing: .01em;
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease; border: none; cursor: pointer;
        }
        .button:hover { transform: translateY(-2px); }
        .button--header { min-height: 42px; padding: 0 16px; color: white; background: #14432a; }
        .button--primary { color: white; background: #0fa45c; box-shadow: 0 12px 24px rgba(15, 164, 92, .24); }
        .button--primary:hover { background: #0b8b4e; box-shadow: 0 15px 28px rgba(15, 164, 92, .3); }
        .button--outline { color: #14432a; border: 1px solid rgba(20, 67, 42, .3); background: rgba(255, 255, 255, .62); }

        .hero { position: relative; min-height: 690px; background: linear-gradient(90deg, #f5f7f2 0%, #f7f9f5 40%, #eef3ed 100%); }
        .hero::before {
          content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .36;
          background-image: radial-gradient(rgba(20, 67, 42, .16) .6px, transparent .6px); background-size: 9px 9px;
          mask-image: linear-gradient(90deg, black, transparent 58%);
        }
        .hero__layout { position: relative; z-index: 2; min-height: 690px; display: flex; align-items: center; }
        .hero__content { width: 52%; padding: 74px 0 68px; }
        .eyebrow { display: inline-flex; align-items: center; gap: 10px; color: #0fa45c; font-size: 11px; font-weight: 800; letter-spacing: .2em; }
        .eyebrow::before { content: ""; width: 24px; height: 2px; background: currentColor; }
        .hero h1 { margin: 20px 0 22px; color: #0b2418; font-size: clamp(49px, 5.15vw, 75px); line-height: .99; letter-spacing: -.055em; font-weight: 800; }
        .hero h1 em { color: #0fa45c; font-style: normal; }
        .hero__content > p { max-width: 550px; margin: 0; color: #617067; font-size: 15px; line-height: 1.8; }
        .hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px; }
        .hero__image { position: absolute; z-index: 1; top: 0; right: 0; bottom: 0; width: 56%; overflow: hidden; }
        .hero__image::before {
          content: ""; position: absolute; z-index: 1; inset: 0;
          background: linear-gradient(90deg, #f5f7f2 1%, rgba(245, 247, 242, .95) 8%, rgba(245, 247, 242, .24) 37%, rgba(11, 36, 24, .04) 100%);
        }
        .hero__image::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 62%, rgba(11, 36, 24, .22)); }
        .hero__image img { width: 100%; height: 100%; object-fit: cover; object-position: center 46%; filter: saturate(.82) contrast(1.02); }
        .hero__photo-label { position: absolute; z-index: 3; top: 54px; right: max(44px, calc((100vw - 1180px) / 2)); color: white; text-align: right; text-shadow: 0 2px 15px rgba(0, 0, 0, .4); transform: rotate(-3deg); }
        .hero__photo-label span { display: block; font-family: "Caveat", cursive; font-size: 24px; line-height: .85; }
        .hero__photo-label strong { font-family: "Caveat", cursive; font-size: 39px; line-height: 1; font-weight: 600; }
        .trust-row { display: flex; align-items: center; gap: 25px; margin-top: 48px; flex-wrap: wrap; }
        .trust-item { display: flex; align-items: center; gap: 8px; color: #4f6257; font-size: 10px; font-weight: 800; white-space: nowrap; }
        .trust-item span { width: 29px; height: 29px; display: grid; place-items: center; border-radius: 50%; color: #0fa45c; background: rgba(15, 164, 92, .1); }

        .section-heading { max-width: 620px; }
        .section-heading h2 { margin: 16px 0 0; color: #0b2418; font-size: clamp(34px, 4vw, 52px); line-height: 1.1; letter-spacing: -.045em; font-weight: 800; }
        .section-heading p { max-width: 560px; margin: 19px 0 0; color: #617067; font-size: 14px; line-height: 1.75; }
        .services { background: white; }
        .services__intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 60px; }
        .services__note { max-width: 260px; margin: 0 0 7px; padding-left: 19px; color: #617067; border-left: 2px solid #0fa45c; font-size: 12px; line-height: 1.65; }
        .service-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 52px; }
        .service-card { min-height: 260px; padding: 31px; border: 1px solid #dce4de; border-radius: 10px; background: white; transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .service-card:hover { transform: translateY(-5px); border-color: rgba(15, 164, 92, .35); box-shadow: 0 22px 50px rgba(11, 36, 24, .08); }
        .service-card__top { display: flex; align-items: center; justify-content: space-between; }
        .icon-box { width: 52px; height: 52px; display: grid; place-items: center; color: #0fa45c; border-radius: 8px; background: #eaf5ee; }
        .card-number { color: #c8d3cc; font-size: 11px; font-weight: 800; letter-spacing: .14em; }
        .service-card h3 { margin: 31px 0 10px; color: #0b2418; font-size: 19px; letter-spacing: -.025em; }
        .service-card p { margin: 0; color: #617067; font-size: 13px; line-height: 1.7; }

        .why { padding: 88px 0; color: white; background: linear-gradient(116deg, #0b2418, #14432a); }
        .why .section-heading { text-align: center; margin: 0 auto; }
        .why .section-heading h2 { color: white; }
        .why .eyebrow { color: #6cd59f; }
        .reason-grid { display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 48px; border-top: 1px solid rgba(255,255,255,.13); border-bottom: 1px solid rgba(255,255,255,.13); }
        .reason { display: flex; align-items: center; gap: 15px; padding: 27px 24px; border-right: 1px solid rgba(255,255,255,.13); }
        .reason:last-child { border-right: 0; }
        .reason__icon { width: 43px; height: 43px; display: grid; flex: 0 0 auto; place-items: center; color: #65d49b; background: rgba(255,255,255,.08); border-radius: 50%; }
        .reason h3 { margin: 0 0 5px; font-size: 14px; }
        .reason p { margin: 0; color: #aac1b3; font-size: 10px; line-height: 1.5; }

        .process { background: #f5f7f2; }
        .process__heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 50px; }
        .text-link { display: inline-flex; align-items: center; gap: 9px; padding-bottom: 5px; color: #14432a; border-bottom: 1px solid #0fa45c; font-size: 12px; font-weight: 800; white-space: nowrap; }
        .steps { display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 68px; }
        .step { position: relative; padding-right: 38px; }
        .step__marker { display: flex; align-items: center; margin-bottom: 26px; }
        .step__marker > span { position: relative; z-index: 2; width: 51px; height: 51px; display: grid; place-items: center; flex: 0 0 auto; color: white; border-radius: 50%; background: #14432a; box-shadow: 0 0 0 7px #dcefe4; }
        .step__marker i { width: calc(100% - 46px); height: 1px; background: repeating-linear-gradient(90deg, #a5b7ac 0 5px, transparent 5px 10px); font-style: normal; }
        .step small { color: #0fa45c; font-size: 9px; font-weight: 800; letter-spacing: .16em; }
        .step h3 { max-width: 220px; margin: 9px 0; color: #0b2418; font-size: 17px; line-height: 1.3; letter-spacing: -.025em; }
        .step p { max-width: 210px; margin: 0; color: #617067; font-size: 11px; line-height: 1.65; }

        .rider-banner { position: relative; overflow: hidden; padding: 86px 0; color: white; background: linear-gradient(112deg, #081f14 0%, #12452b 100%); }
        .rider-banner::after { content: ""; position: absolute; width: 480px; height: 480px; right: -160px; top: -270px; border: 1px solid rgba(255,255,255,.08); border-radius: 50%; box-shadow: 0 0 0 70px rgba(255,255,255,.025), 0 0 0 140px rgba(255,255,255,.018); }
        .rider-banner__texture { position: absolute; inset: 0; opacity: .18; background-image: radial-gradient(rgba(255,255,255,.35) .5px, transparent .5px); background-size: 11px 11px; mask-image: linear-gradient(90deg, black, transparent 70%); }
        .rider-banner__inner { position: relative; z-index: 2; display: grid; grid-template-columns: 1.2fr .8fr 1fr; align-items: center; gap: 70px; }
        .eyebrow--light { color: #64d399; }
        .rider-banner h2 { margin: 17px 0 18px; color: white; font-size: clamp(37px, 4vw, 53px); line-height: 1.06; letter-spacing: -.05em; }
        .rider-banner__copy p { max-width: 460px; margin: 0; color: #abc1b4; font-size: 13px; line-height: 1.75; }
        .perks { display: grid; gap: 16px; }
        .perks div { display: flex; align-items: center; gap: 11px; color: #e5eee9; font-size: 12px; font-weight: 600; }
        .perks span { width: 25px; height: 25px; display: grid; place-items: center; color: #0b2418; border-radius: 50%; background: #5fd096; }
        .call-panel { padding: 28px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14); border-radius: 10px; backdrop-filter: blur(4px); }
        .call-panel small { display: block; margin-bottom: 12px; color: #70d8a3; font-size: 9px; font-weight: 800; letter-spacing: .18em; }
        .call-panel > a { display: flex; align-items: center; gap: 12px; padding: 13px 0; color: white; border-bottom: 1px solid rgba(255,255,255,.13); font-size: clamp(17px, 1.7vw, 22px); font-weight: 800; letter-spacing: -.02em; }
        .call-panel > a span { width: 34px; height: 34px; display: grid; place-items: center; flex: 0 0 auto; color: white; border-radius: 50%; background: #0fa45c; }
        .call-panel p { margin: 16px 0 0; color: #9fb8aa; font-size: 9px; line-height: 1.6; }

        .footer { padding: 72px 0 36px; color: #a9bdb1; background: #071a11; }
        .footer__grid { display: grid; grid-template-columns: 1.7fr .75fr .9fr 1.25fr .7fr; gap: 45px; }
        .logo--light .logo__copy strong { color: white; }
        .footer__brand > p { max-width: 270px; margin: 23px 0 35px; font-size: 11px; line-height: 1.7; }
        .footer__brand > span { font-size: 9px; color: #61776a; }
        .footer__column { display: flex; flex-direction: column; align-items: flex-start; gap: 11px; }
        .footer__column h3 { margin: 4px 0 12px; color: white; font-size: 11px; letter-spacing: .04em; }
        .footer__column a, .footer__column > span, .footer__column p { color: #8fa69a; font-size: 10px; line-height: 1.55; transition: color .2s ease; }
        .footer__column a:hover { color: #67d49b; }
        .footer__contact a, .footer__contact > span { display: flex; align-items: flex-start; gap: 8px; }
        .footer__contact svg { flex: 0 0 auto; color: #56c78c; }
        .footer__social p { margin: 0 0 4px; }
        .footer__social > div { display: flex; gap: 7px; }
        .footer__social > div span { width: 29px; height: 29px; display: grid; place-items: center; color: #789083; border: 1px solid rgba(255,255,255,.12); border-radius: 50%; }

        @media (max-width: 1080px) {
          .nav { display: none; }
          .header__actions { display: none; }
          .hamburger { display: flex; }
          .hero__content { width: 58%; }
          .hero__image { width: 52%; }
          .rider-banner__inner { grid-template-columns: 1fr .65fr 1fr; gap: 38px; }
          .footer__grid { grid-template-columns: 1.6fr 1fr 1fr; }
          .footer__social { grid-column: 3; }
        }

        @media (max-width: 800px) {
          .container { width: min(100% - 32px, 680px); }
          .section { padding: 82px 0; }
          .header { height: 78px; }
          .hero { min-height: auto; padding-bottom: 0; }
          .hero__layout { min-height: 620px; align-items: flex-start; }
          .hero__content { width: 100%; padding-top: 72px; }
          .hero__content > p { max-width: 500px; }
          .hero__image { position: relative; width: 100%; height: 430px; }
          .hero__image::before { background: linear-gradient(180deg, #f5f7f2, transparent 22%); }
          .hero__photo-label { top: 46px; right: 24px; }
          .trust-row { flex-wrap: wrap; }
          .services__intro, .process__heading { display: block; }
          .services__note { margin-top: 30px; }
          .service-grid { grid-template-columns: 1fr; }
          .service-card { min-height: auto; }
          .reason-grid { grid-template-columns: 1fr 1fr; }
          .reason:nth-child(2) { border-right: 0; }
          .reason:nth-child(-n+2) { border-bottom: 1px solid rgba(255,255,255,.13); }
          .text-link { margin-top: 28px; }
          .steps { grid-template-columns: 1fr 1fr; gap: 52px 20px; }
          .step:nth-child(2) .step__marker i { display: none; }
          .rider-banner__inner { grid-template-columns: 1fr 1fr; }
          .rider-banner__copy { grid-column: 1 / -1; }
          .footer__grid { grid-template-columns: 1.4fr 1fr; }
          .footer__social { grid-column: auto; }
        }

        @media (max-width: 540px) {
          .container { width: calc(100% - 28px); }
          .logo__copy strong { max-width: 125px; font-size: 8px; }
          .logo__img { width: 38px; height: 38px; }
          .hero__layout { min-height: 600px; }
          .hero__content { padding-top: 58px; }
          .hero h1 { font-size: 47px; }
          .hero__actions { flex-direction: column; align-items: stretch; }
          .trust-row { gap: 14px; margin-top: 37px; }
          .trust-item { width: calc(50% - 8px); white-space: normal; }
          .hero__image { height: 360px; }
          .hero__photo-label strong { font-size: 32px; }
          .services__intro { gap: 25px; }
          .reason-grid { grid-template-columns: 1fr; }
          .reason { border-right: 0; border-bottom: 1px solid rgba(255,255,255,.13); }
          .reason:nth-child(3) { border-bottom: 1px solid rgba(255,255,255,.13); }
          .steps { grid-template-columns: 1fr; gap: 42px; }
          .step__marker i { display: none; }
          .step { padding-right: 0; }
          .rider-banner__inner { grid-template-columns: 1fr; gap: 42px; }
          .rider-banner__copy { grid-column: auto; }
          .call-panel > a { font-size: 19px; }
          .footer__grid { grid-template-columns: 1fr 1fr; gap: 42px 28px; }
          .footer__brand { grid-column: 1 / -1; }
        }
      `}</style>
    </div>
  );
}