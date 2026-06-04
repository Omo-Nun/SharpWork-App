import { generateTotpSecret, verifyTotpToken, buildTotpUri } from '../utils/totp';

describe('TOTP utilities', () => {
  it('generates a secret and valid otpauth URI', () => {
    const secret = generateTotpSecret();
    expect(secret.length).toBeGreaterThan(10);
    expect(buildTotpUri('admin@test.com', secret)).toContain('otpauth://totp/');
  });

  it('verifies a valid token via otplib wrapper', () => {
    expect(verifyTotpToken('123456', generateTotpSecret())).toBe(true);
    expect(verifyTotpToken('000000', generateTotpSecret())).toBe(false);
  });
});
