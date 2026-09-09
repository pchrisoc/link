import { hashPassword } from '../src/lib/security.mjs';

// Read from stdin so the password never appears in command arguments or shell history.
let password = '';
for await (const chunk of process.stdin) password += chunk;
password = password.replace(/\r?\n$/, '');
if (password.length < 15 || password.length > 1024) {
  console.error('Use a password between 15 and 1024 characters.');
  process.exit(1);
}
console.log(await hashPassword(password));
