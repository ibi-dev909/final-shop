// Generates a value to paste into ADMIN_PASSWORD_HASH in .env.local.
// Your password never leaves this machine — only the hash does.
//
// Usage:
//   node scripts/hash-admin-password.mjs "your-chosen-password"

import { randomBytes, scryptSync } from "crypto";

const password = process.argv[2];

if (!password) {
  console.error(
    'Usage: node scripts/hash-admin-password.mjs "your-chosen-password"'
  );
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");

console.log("\nAdd this line to .env.local:\n");
console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}\n`);
