import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import connectMongoDB from '../config/database';
import { Session, LoginAttempt } from '../models/auth';
import { hashToken, normalizeEmail } from './security.mjs';

export const sessionCookie = process.env.NODE_ENV === 'production' ? '__Host-link-session' : 'link-session';
export const sessionSeconds = 60 * 60 * 12;
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' };
export const authConfigured = () => Boolean(normalizeEmail(process.env.AUTH_EMAIL) && /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(process.env.AUTH_PASSWORD_HASH || '') && (process.env.NODE_ENV !== 'production' || process.env.AUTH_URL));
const credentialVersion = () => hashToken(`${normalizeEmail(process.env.AUTH_EMAIL)}:${process.env.AUTH_PASSWORD_HASH}`);

export async function getSession() {
  const token = cookies().get(sessionCookie)?.value;
  if (!authConfigured() || !/^[a-f0-9]{64}$/.test(token || '')) return null;
  await connectMongoDB();
  return Session.findOne({ tokenHash: hashToken(token), credentialVersion: credentialVersion(), expiresAt: { $gt: new Date() } }).lean();
}

export async function createSession() {
  await connectMongoDB();
  const token = randomBytes(32).toString('hex');
  // Rotate any existing session when signing in again.
  await deleteSession();
  await Session.create({ tokenHash: hashToken(token), credentialVersion: credentialVersion(), expiresAt: new Date(Date.now() + sessionSeconds * 1000) });
  return token;
}

export async function deleteSession() {
  const token = cookies().get(sessionCookie)?.value;
  if (!token) return;
  await connectMongoDB();
  await Session.deleteOne({ tokenHash: hashToken(token) });
}

export async function allowLoginAttempt() {
  await connectMongoDB();
  // A shared owner-account budget cannot be bypassed with spoofed IP headers or email variations.
  const window = Math.floor(Date.now() / (15 * 60 * 1000));
  const id = `owner:${window}`;
  let attempt;
  try {
    attempt = await LoginAttempt.findOneAndUpdate({ _id: id }, {
      $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 1) * 15 * 60 * 1000) },
    }, { upsert: true, new: true });
  } catch (error) {
    if (error.code !== 11000) throw error;
    attempt = await LoginAttempt.findOneAndUpdate({ _id: id }, { $inc: { count: 1 } }, { new: true });
  }
  return attempt.count <= 10;
}
