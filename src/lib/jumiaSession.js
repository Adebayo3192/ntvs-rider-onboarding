import crypto from 'crypto';

const MAX_AGE_SECONDS = 60 * 60 * 12; // 12-hour session
const DEV_FALLBACK_SECRET = 'dev-only-insecure-secret';

let warnedAboutFallback = false;

// Checked on first use rather than at import: `next build` imports every
// route module, so throwing at import would break the build on any machine
// that doesn't have the secret. In production a missing secret throws here,
// so no session is ever signed or accepted with a guessable key.
function getSecret() {
  const secret = process.env.JUMIA_SESSION_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JUMIA_SESSION_SECRET is not set — refusing to sign or verify Jumia sessions without it.');
  }

  if (!warnedAboutFallback) {
    console.warn('JUMIA_SESSION_SECRET is not set — using an insecure dev-only fallback. Set it to a long random string before deploying.');
    warnedAboutFallback = true;
  }
  return DEV_FALLBACK_SECRET;
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createJumiaSessionToken(riderId) {
  const payload = `${riderId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyJumiaSessionToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [riderId, issuedAtStr, signature] = parts;
  const expected = sign(`${riderId}.${issuedAtStr}`);

  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  const issuedAt = parseInt(issuedAtStr, 10);
  if (!issuedAt || Date.now() - issuedAt > MAX_AGE_SECONDS * 1000) return null;

  return riderId;
}

export const JUMIA_COOKIE_NAME = 'jumia_session';
export const JUMIA_COOKIE_MAX_AGE = MAX_AGE_SECONDS;