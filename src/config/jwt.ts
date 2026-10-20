import crypto from 'crypto';

// JWT signing secret. Must come from the environment in production; there is
// deliberately no hardcoded fallback, because a fallback in a public repo lets
// anyone forge tokens.
let devSecret: string | undefined;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error('JWT_SECRET is not set');
  }

  // Local development only: a random per-process secret (tokens reset on restart).
  if (!devSecret) {
    devSecret = crypto.randomBytes(32).toString('hex');
    console.warn('[auth] JWT_SECRET not set; using a random dev-only secret for this process.');
  }
  return devSecret;
}
