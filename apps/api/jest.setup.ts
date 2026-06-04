import dotenv from 'dotenv';

dotenv.config();
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: () => 'JBSWY3DPEHPK3PXPTESTSECRET12',
    keyuri: (email: string, issuer: string, secret: string) =>
      `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}`,
    verify: ({ token }: { token: string }) => token === '123456',
  },
}));
