import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

describe('JWT utilities', () => {
  it('generates and verifies access and refresh tokens', () => {
    const { accessToken, refreshToken } = generateTokens('user-123', 'CUSTOMER');
    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');

    const accessPayload = verifyAccessToken(accessToken) as { userId: string; role: string };
    expect(accessPayload.userId).toBe('user-123');
    expect(accessPayload.role).toBe('CUSTOMER');

    const refreshPayload = verifyRefreshToken(refreshToken) as { userId: string; role: string };
    expect(refreshPayload.userId).toBe('user-123');
  });
});
