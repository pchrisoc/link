// Requires a completed build and mongod on PATH. Uses only a temporary local database.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { MongoClient } from 'mongodb';
import { hashPassword, hashToken } from '../src/lib/security.mjs';

const dir = await mkdtemp(join(tmpdir(), 'link-auth-test-'));
async function freePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
const dbPort = await freePort();
const appPort = await freePort();
const origin = `http://127.0.0.1:${appPort}`;
const mongoURI = `mongodb://127.0.0.1:${dbPort}/${basename(dir).replaceAll("-", "_")}`;
let mongo, app, client;
let logs = '';
const pause = () => new Promise(resolve => setTimeout(resolve, 200));
async function ready(check) {
  for (let i = 0; i < 100; i++) {
    try { if (await check()) return; } catch {}
    await pause();
  }
  throw new Error('Test service did not start: ' + logs);
}
function launch(command, args, env) {
  const child = spawn(command, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', chunk => { logs += chunk; });
  child.stderr.on('data', chunk => { logs += chunk; });
  child.on('error', error => { logs += error.message; });
  return child;
}
async function stop(child) {
  if (!child || child.exitCode !== null || !child.pid) return;
  const exited = once(child, 'exit');
  child.kill('SIGTERM');
  await exited;
}
async function request(path, { body, cookie, requestOrigin = origin, method } = {}) {
  return fetch(origin + path, {
    redirect: 'manual', method: method || (body ? 'POST' : 'GET'),
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...(requestOrigin ? { origin: requestOrigin } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
try {
  mongo = launch('mongod', ['--dbpath', dir, '--port', String(dbPort), '--bind_ip', '127.0.0.1', '--quiet'], process.env);
  client = new MongoClient(mongoURI, { serverSelectionTimeoutMS: 500 });
  await ready(async () => { await client.connect(); return true; });
  const password = 'test-only randomly isolated password';
  app = launch(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(appPort), '-H', '127.0.0.1'], {
    ...process.env, NODE_ENV: 'production', MONGODB_URL: mongoURI,
    AUTH_URL: origin, AUTH_EMAIL: 'owner@example.com', AUTH_PASSWORD_HASH: await hashPassword(password),
  });
  await ready(async () => (await request('/login')).status === 200);
  let response = await request('/');
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), '/login');
  assert.equal((await request('/api/shorten', { body: { url: 'https://example.com' } })).status, 401);
  assert.equal((await request('/', { cookie: '__Host-link-session=' + 'a'.repeat(64) })).status, 307);
  const credentials = { email: 'OWNER@example.com', password };
  assert.equal((await request('/api/auth/login', { body: credentials, requestOrigin: 'https://evil.com' })).status, 403);
  assert.equal((await request('/api/auth/login', { body: credentials, requestOrigin: null })).status, 403);
  assert.equal((await request('/api/auth/login', { body: { ...credentials, password: 'incorrect' } })).status, 401);
  response = await request('/api/auth/login', { body: credentials });
  assert.equal(response.status, 200);
  const setCookie = response.headers.get('set-cookie');
  for (const attribute of ['HttpOnly', 'Secure', 'SameSite=lax', 'Path=/', 'Max-Age=43200']) assert.ok(setCookie.includes(attribute), attribute);
  const cookie = setCookie.split(';')[0];
  assert.equal((await request('/', { cookie })).status, 200);
  assert.equal((await request('/api/shorten', { cookie, requestOrigin: 'https://evil.com', body: { url: 'https://example.com' } })).status, 403);
  for (const body of [{ url: 'javascript:alert(1)' }, { url: 'https://example.com', customAddress: 'login' }, { url: 'https://example.com', customAddress: { $ne: '' } }]) {
    assert.equal((await request('/api/shorten', { cookie, body })).status, 400);
  }
  response = await request('/api/shorten', { cookie, body: { url: 'https://example.com/public?q=1', customAddress: 'public-test' } });
  assert.equal(response.status, 200);
  response = await request('/public-test');
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), 'https://example.com/public?q=1');
  await client.db().collection('urls').insertOne({ unique: 'unsafe-legacy', url: 'javascript:alert(1)' });
  assert.equal((await request('/unsafe-legacy')).status, 404);
  assert.equal((await request('/does-not-exist')).status, 404);
  assert.equal((await request('/api/auth/logout', { method: 'POST', cookie, requestOrigin: 'https://evil.com' })).status, 403);
  assert.equal((await request('/api/auth/logout', { method: 'POST', cookie })).status, 200);
  assert.equal((await request('/', { cookie })).status, 307);
  assert.equal((await request('/api/shorten', { cookie, body: { url: 'https://example.com' } })).status, 401);
  response = await request('/api/auth/login', { body: credentials });
  const expiringCookie = response.headers.get('set-cookie').split(';')[0];
  await client.db().collection('authsessions').updateOne({ tokenHash: hashToken(expiringCookie.split('=')[1]) }, { $set: { expiresAt: new Date(0) } });
  assert.equal((await request('/', { cookie: expiringCookie })).status, 307);
  // Three attempts have been consumed; seven more exhaust the shared budget.
  for (let i = 0; i < 7; i++) assert.equal((await request('/api/auth/login', { body: { ...credentials, email: `other${i}@example.com` } })).status, 401);
  response = await request('/api/auth/login', { body: credentials });
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '900');
  assert.equal((await request('/public-test')).status, 307);
  console.log('Auth integration passed: protected routes, sign-in, secure cookies, CSRF, URL validation, public redirects, logout, expiry, and shared throttling.');
} finally {
  await stop(app);
  await client?.close();
  await stop(mongo);
  await rm(dir, { recursive: true, force: true });
}
