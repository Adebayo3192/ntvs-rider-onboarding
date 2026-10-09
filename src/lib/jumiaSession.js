import crypto from 'crypto';

const SECRET = process.env.JUMIA_SESSION_SECRET;
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12-hour session

if (!SECRET) {
  console.error('JUMIA_SESSION_SECRET is not set in your environment — set it to a long random string before deploying.');
}

function sign(payload) {
  return crypto.createHmac('sha256', SECRET || 'dev-only-insecure-secret').update(payload).digest('hex');
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