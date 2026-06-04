import dotenv from 'dotenv';

dotenv.config();
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

jest.mock('otplib', () => ({
  generateSecret: () => 'JBSWY3DPEHPK3PXPTESTSECRET12',
  generateURI: ({ issuer, label, secret }: { issuer: string; label: string; secret: string }) =>
    `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}`,
  verifySync: ({ token }: { token: string }) => ({ valid: token === '123456' }),
  generateSync: () => '123456',
}));
