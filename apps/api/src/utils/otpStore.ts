import crypto from 'crypto';
import { getRedis } from '../lib/redis';

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes per PRD
const OTP_COOLDOWN_SECONDS = 60;

export type OtpPurpose = 'password_reset';

function otpKey(purpose: OtpPurpose, phoneNumber: string): string {
  return `otp:${purpose}:${phoneNumber}`;
}

function cooldownKey(purpose: OtpPurpose, phoneNumber: string): string {
  return `otp:cooldown:${purpose}:${phoneNumber}`;
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function isOtpOnCooldown(purpose: OtpPurpose, phoneNumber: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const exists = await redis.exists(cooldownKey(purpose, phoneNumber));
  return exists === 1;
}

export async function storeOtp(
  purpose: OtpPurpose,
  phoneNumber: string,
  otp: string,
  userId: string
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const payload = JSON.stringify({ userId, otpHash: hashOtp(otp) });

  await redis
    .multi()
    .set(otpKey(purpose, phoneNumber), payload, 'EX', OTP_TTL_SECONDS)
    .set(cooldownKey(purpose, phoneNumber), '1', 'EX', OTP_COOLDOWN_SECONDS)
    .exec();
}

export async function consumeOtp(
  purpose: OtpPurpose,
  phoneNumber: string,
  otp: string
): Promise<{ userId: string } | null> {
  const redis = getRedis();
  if (!redis) return null;
  const key = otpKey(purpose, phoneNumber);
  const raw = await redis.get(key);

  if (!raw) return null;

  const record = JSON.parse(raw) as { userId: string; otpHash: string };
  if (record.otpHash !== hashOtp(otp)) return null;

  await redis.del(key);
  return { userId: record.userId };
}
