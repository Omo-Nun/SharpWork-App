import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';

export function generateTotpSecret(): string {
  return generateSecret();
}

export function buildTotpUri(email: string, secret: string): string {
  return generateURI({
    issuer: 'SharpWork Admin',
    label: email,
    secret,
  });
}

export function verifyTotpToken(token: string, secret: string): boolean {
  const result = verifySync({ secret, token });
  return result.valid;
}

export async function generateTotpQrCode(otpAuthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUrl);
}
