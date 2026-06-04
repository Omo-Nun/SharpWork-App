import crypto from 'crypto';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

function getSecretKey(): string | undefined {
  return process.env.PAYSTACK_SECRET_KEY;
}

export async function initializeTransaction(
  email: string,
  amountNaira: number,
  callbackUrl: string,
  metadata?: Record<string, unknown>
): Promise<PaystackInitResult> {
  const secretKey = getSecretKey();
  const reference = `sw_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const amountKobo = Math.round(amountNaira * 100);

  if (!secretKey) {
    console.log(`[Paystack Dev] Init ₦${amountNaira} for ${email} ref=${reference} (escrow hold)`);
    const webUrl = process.env.WEB_APP_URL || 'http://localhost:3002';
    return {
      authorization_url: `${webUrl}/book/payment/callback?reference=${reference}&dev=1`,
      access_code: 'dev_access_code',
      reference,
    };
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amountKobo,
      callback_url: callbackUrl,
      reference,
      metadata: { ...metadata, escrow_hold: true },
      // Full amount to platform balance; artisan paid via transfer on job completion
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || 'Paystack initialization failed');
  }

  return {
    authorization_url: data.data.authorization_url,
    access_code: data.data.access_code,
    reference: data.data.reference,
  };
}

export async function verifyTransaction(reference: string): Promise<{ success: boolean; amount: number }> {
  const secretKey = getSecretKey();

  if (!secretKey) {
    console.log(`[Paystack Dev] Verify ref=${reference}`);
    return { success: true, amount: 0 };
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    return { success: false, amount: 0 };
  }

  return {
    success: data.data.status === 'success',
    amount: data.data.amount / 100,
  };
}

export function verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
  const secretKey = getSecretKey();
  if (!secretKey) return true;

  const hash = crypto.createHmac('sha512', secretKey).update(payload).digest('hex');
  return hash === signature;
}

export async function createSubaccount(
  businessName: string,
  settlementBank: string,
  accountNumber: string,
  percentageCharge = 0
) {
  const secretKey = getSecretKey();
  if (!secretKey) {
    return { subaccount_code: `SUB_dev_${crypto.randomBytes(3).toString('hex')}` };
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/subaccount`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      business_name: businessName,
      settlement_bank: settlementBank,
      account_number: accountNumber,
      percentage_charge: percentageCharge,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || 'Subaccount creation failed');
  }

  return { subaccount_code: data.data.subaccount_code as string };
}

export async function transferToArtisan(params: {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amountNaira: number;
  reason: string;
  reference: string;
}): Promise<void> {
  const secretKey = getSecretKey();
  const amountKobo = Math.round(params.amountNaira * 100);

  if (!secretKey) {
    console.log(
      `[Paystack Dev] Transfer ₦${params.amountNaira} to ${params.accountNumber} ref=${params.reference}`
    );
    return;
  }

  const recipientResponse = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'nuban',
      name: params.accountName,
      account_number: params.accountNumber,
      bank_code: params.bankCode,
      currency: 'NGN',
    }),
  });

  const recipientData = await recipientResponse.json();
  if (!recipientResponse.ok || !recipientData.status) {
    throw new Error(recipientData.message || 'Failed to create transfer recipient');
  }

  const transferResponse = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount: amountKobo,
      recipient: recipientData.data.recipient_code,
      reason: params.reason,
      reference: params.reference,
    }),
  });

  const transferData = await transferResponse.json();
  if (!transferResponse.ok || !transferData.status) {
    throw new Error(transferData.message || 'Paystack transfer failed');
  }
}

export async function refundTransaction(reference: string, amountNaira?: number): Promise<void> {
  const secretKey = getSecretKey();

  if (!secretKey) {
    console.log(`[Paystack Dev] Refund ref=${reference} amount=${amountNaira ?? 'full'}`);
    return;
  }

  const body: Record<string, unknown> = { transaction: reference };
  if (amountNaira !== undefined) {
    body.amount = Math.round(amountNaira * 100);
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/refund`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || 'Paystack refund failed');
  }
}
