import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const options = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
export const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64, options);
  return `scrypt:${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || password.length > 1024 ||
      !/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(encoded || '')) return false;
  const [, salt, expected] = encoded.split(':');
  const actual = await scrypt(password, salt, 64, options);
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}

export function safeDestination(value) {
  if (typeof value !== 'string' || value.length > 8192 || /[\u0000-\u0020\u007f\\]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

export function validAlias(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value) &&
    !['login', 'api', '_next'].includes(value.toLowerCase());
}

export function trustedOrigin(request) {
  const configured = process.env.AUTH_URL;
  if (!configured && process.env.NODE_ENV === 'production') return false;
  try {
    const expected = new URL(configured || request.url).origin;
    return request.headers.get('origin') === expected;
  } catch { return false; }
}
