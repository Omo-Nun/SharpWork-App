import crypto from 'crypto';

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateVerificationToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  return { token, tokenHash, expiresAt };
}

export function hashVerificationToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
