import { NextResponse } from 'next/server';
import { cookieOptions, deleteSession, sessionCookie } from '../../../../lib/auth';
import { trustedOrigin } from '../../../../lib/security.mjs';

export async function POST(request) {
  if (!trustedOrigin(request)) return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403 });
  try {
    await deleteSession();
    const response = NextResponse.json({ message: 'Signed out.' }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(sessionCookie, '', { ...cookieOptions, maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ message: 'Sign-out failed. Please try again.' }, { status: 503 });
  }
}
