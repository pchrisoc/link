# pchrisoc.com links

A Next.js and MongoDB link shortener with private email/password sign-in and public short links.

## Access

- `/` requires the owner's email and password.
- `POST /api/shorten` requires a valid session and a matching request origin.
- `/<alias>` is public: recipients can follow shared links without signing in.
- `/login` is public. There is no public registration.
- Destinations must be HTTP or HTTPS URLs without embedded credentials. Existing links are also checked before redirecting. This validates URL structure; it does not scan destinations for malware or phishing.

## Setup

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set `MONGODB_URL` (or `MONGODB_URI`), `AUTH_EMAIL`, and `AUTH_URL`.
3. Generate a password hash with a password of at least 15 characters. In the default macOS zsh shell, this hides input and keeps the password out of shell history and process arguments:

   ```zsh
   read -rs 'link_password?Password: '; print
   print -rn -- "$link_password" | node scripts/hash-password.mjs
   unset link_password
   ```

4. Put the generated `scrypt:...` value in `AUTH_PASSWORD_HASH` in `.env.local`.
5. Run `npm run dev` and open http://localhost:3000.

For production, set these variables in the hosting environment, with `AUTH_URL=https://pchrisoc.com`, then run `npm run build` and `npm start`. Production requires HTTPS for session cookies. Requests that mutate data must originate from the configured origin; redirect any alternate management hostname to that canonical origin. Public short links continue to work on all served hostnames.

Authentication fails closed when credentials are missing. Configure the production credentials before deploying. No credentials are committed or automatically created.

## Sessions and recovery

Passwords use salted scrypt hashes. Random session tokens are held in HttpOnly, SameSite cookies (Secure and host-only in production); MongoDB stores only their SHA-256 hashes. Sessions expire after 12 hours and are deleted on logout. Changing `AUTH_EMAIL` or `AUTH_PASSWORD_HASH` invalidates existing sessions after the updated environment is loaded. To reset the password, generate a new hash, update the environment, and restart/redeploy.

Sign-in permits 10 attempts per 15-minute window across the owner account, backed by MongoDB so the limit is shared across app instances. All supplied emails share the budget to prevent bypass. This also means repeated attempts can temporarily prevent the owner from signing in. MongoDB TTL indexes clean up expired sessions and attempt counters; expiry is enforced independently of cleanup.

## Verification

```sh
npm test
npm run build
# Optional full integration test; requires mongod on PATH and the completed build:
npm run test:integration
```

Check that an anonymous visit to `/` reaches `/login`, anonymous link creation returns 401, valid credentials allow creation, and logout removes access. Open a created short link in a private window to confirm it redirects without login. Unsafe destinations such as `javascript:` must be rejected.
