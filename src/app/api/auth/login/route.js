import { NextResponse } from 'next/server';
import { authConfigured, allowLoginAttempt, createSession, cookieOptions, sessionCookie, sessionSeconds } from '../../../../lib/auth';
import { normalizeEmail, trustedOrigin, verifyPassword } from '../../../../lib/security.mjs';

export const runtime = 'nodejs';
export async function POST(request) {
  const reply = (message, status) => NextResponse.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });
  if (!trustedOrigin(request)) return reply('Invalid request origin.', 403);
  if (!authConfigured()) return reply('Sign-in is not configured. Contact the site owner.', 503);
  try {
    const data = await request.json().catch(() => null);
    if (!data || typeof data.email !== 'string' || data.email.length > 254 || typeof data.password !== 'string' || data.password.length > 1024) return reply('Invalid email or password.', 400);
    if (!await allowLoginAttempt()) {
      const response = reply('Too many sign-in attempts. Try again in 15 minutes.', 429);
      response.headers.set('Retry-After', '900');
      return response;
    }
    const valid = await verifyPassword(data.password, process.env.AUTH_PASSWORD_HASH);
    if (!valid || normalizeEmail(data.email) !== normalizeEmail(process.env.AUTH_EMAIL)) return reply('Invalid email or password.', 401);
    const token = await createSession();
    const response = reply('Signed in.', 200);
    response.cookies.set(sessionCookie, token, { ...cookieOptions, maxAge: sessionSeconds });
    return response;
  } catch {
    return reply('Sign-in is temporarily unavailable. Please try again.', 503);
  }
}
