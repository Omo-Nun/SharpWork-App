import {
  createSubaccount,
  initializeTransaction,
  transferToArtisan,
  verifyTransaction,
  verifyWebhookSignature,
} from '../utils/paystack';

describe('Paystack dev mode', () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;

  beforeEach(() => {
    delete process.env.PAYSTACK_SECRET_KEY;
  });

  afterAll(() => {
    process.env.PAYSTACK_SECRET_KEY = originalSecret;
  });

  it('initializes transaction without API key', async () => {
    const result = await initializeTransaction('test@example.com', 5000, 'http://localhost/callback');
    expect(result.reference).toMatch(/^sw_/);
    expect(result.authorization_url).toContain('reference=');
  });

  it('verifies transaction in dev mode', async () => {
    const result = await verifyTransaction('sw_test_ref');
    expect(result.success).toBe(true);
  });

  it('creates dev subaccount', async () => {
    const result = await createSubaccount('Test Artisan', '058', '0123456789');
    expect(result.subaccount_code).toMatch(/^SUB_dev_/);
  });

  it('transfers in dev mode without error', async () => {
    await expect(
      transferToArtisan({
        bankCode: '058',
        accountNumber: '0123456789',
        accountName: 'Test User',
        amountNaira: 1000,
        reason: 'Test',
        reference: 'test_ref',
      })
    ).resolves.toBeUndefined();
  });

  it('accepts webhook signature in dev mode', () => {
    expect(verifyWebhookSignature('payload', 'anything')).toBe(true);
  });
});
