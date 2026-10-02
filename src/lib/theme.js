// Shared design tokens for NTVL, pulled from the new homepage design.
// Import these into any page (admin dashboard, Jumia pages, rider
// onboarding) instead of hard-coding colors/fonts/styles inline, so the
// whole product reads as one system instead of the homepage being the
// only polished page.
//
// Usage:
//   import { COLORS, FONT, btnPrimary, btnOutline, card, iconBox } from '@/lib/theme';
//   <button style={btnPrimary}>Save</button>

export const COLORS = {
  // Darkest — header text, dark section backgrounds
  forest: '#0B2418',
  // Secondary dark green — paired with forest in gradients, button fills
  forestLight: '#14432A',
  // The signature accent green — CTAs, icons, highlighted text, active states
  accent: '#0FA45C',
  // Accent's hover/pressed state
  accentDark: '#0B8B4E',
  // Soft section backgrounds (alternate with white instead of flat gray)
  mint: '#F3FAF6',
  cream: '#F5F7F2',
  // Muted body text — replaces plain gray
  muted: '#617067',
  muted2: '#7C8A83',
  // Hairline borders
  line: '#DCE4DE',
  line2: '#E7ECE8',
  // Tinted icon-circle background
  iconTint: '#DCF4E6',
  iconTint2: '#EAF5EE',
};

export const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ---- Shared style objects (for pages using inline styles, e.g. the
// admin dashboard and Jumia pages) ----

export const card = {
  background: '#fff',
  borderRadius: 10,
  border: `1px solid ${COLORS.line}`,
  padding: 22,
};

export const iconBox = {
  width: 42,
  height: 42,
  borderRadius: 10,
  background: COLORS.iconTint2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 'none',
};

export const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 46,
  padding: '0 22px',
  borderRadius: 6,
  border: 'none',
  background: COLORS.accent,
  color: '#fff',
  fontFamily: FONT,
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  textDecoration: 'none',
  boxShadow: `0 10px 22px rgba(15, 164, 92, .24)`,
};

export const btnOutline = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 46,
  padding: '0 22px',
  borderRadius: 6,
  border: `1.5px solid ${COLORS.line}`,
  background: 'transparent',
  color: COLORS.forestLight,
  fontFamily: FONT,
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  textDecoration: 'none',
};

export const btnOutlineOnDark = {
  ...btnOutline,
  border: '1.5px solid rgba(255,255,255,.4)',
  color: '#fff',
};

export const btnHeader = {
  ...btnPrimary,
  height: 42,
  padding: '0 16px',
  background: COLORS.forestLight,
  boxShadow: 'none',
};

// Dark gradient used behind banners/CTAs (the "Why Choose" band, the
// rider-recruitment banner on the homepage)
export const darkGradient = `linear-gradient(116deg, ${COLORS.forest}, ${COLORS.forestLight})`;

// Standard section max-width — use as a wrapping div's style or className
export const container = {
  width: 'min(1180px, calc(100% - 48px))',
  margin: '0 auto',
};