import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, safeDestination, validAlias, trustedOrigin, normalizeEmail } from '../src/lib/security.mjs';

test('password hashes are salted and only the correct password verifies', async () => {
  const password = 'a long unique password';
  const first = await hashPassword(password);
  assert.notEqual(first, await hashPassword(password));
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword('wrong password', first), false);
  assert.equal(await verifyPassword(password, 'malformed'), false);
  assert.equal(await verifyPassword('x'.repeat(1025), first), false);
});

test('public redirect destinations reject executable schemes and ambiguous URLs', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'file:///etc/passwd', '//evil.com', '/login', 'https://user:pass@example.com', 'https://example.com\n', 'https:\\evil.com', {}, null]) {
    assert.equal(safeDestination(url), null, String(url));
  }
  assert.equal(safeDestination('https://example.com/path?q=hello#section'), 'https://example.com/path?q=hello#section');
  assert.equal(safeDestination('http://example.com'), 'http://example.com/');
});

test('aliases cannot shadow auth routes or contain path/control characters', () => {
  for (const alias of ['login', 'LOGIN', 'api', '_next', '../admin', 'a/b', 'x?y', 'x'.repeat(65), '', {}]) assert.equal(validAlias(alias), false);
  assert.equal(validAlias('my-link_123'), true);
});

test('mutations require exactly the configured origin', () => {
  const previous = process.env.AUTH_URL;
  process.env.AUTH_URL = 'https://pchrisoc.com';
  try {
    const request = (origin) => new Request('https://pchrisoc.com/api/shorten', { headers: origin ? { origin } : {} });
    assert.equal(trustedOrigin(request('https://pchrisoc.com')), true);
    for (const origin of [null, 'null', 'https://evil.com', 'https://pchrisoc.com.evil.com', 'http://pchrisoc.com']) assert.equal(trustedOrigin(request(origin)), false);
    assert.equal(normalizeEmail(' Owner@Example.com '), 'owner@example.com');
  } finally {
    if (previous === undefined) delete process.env.AUTH_URL;
    else process.env.AUTH_URL = previous;
  }
});
