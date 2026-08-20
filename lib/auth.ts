import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// Only used server-side from the login API route (Node.js runtime) —
// never from middleware, which runs on the Edge runtime and doesn't
// support Node's crypto module. See lib/session.ts for the part that
// does need to run in middleware.

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;

  return timingSafeEqual(candidate, expected);
}
