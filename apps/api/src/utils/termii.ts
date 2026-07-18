const TERMII_BASE_URL = process.env.TERMII_BASE_URL || 'https://api.ng.termii.com/api';
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'SharpWork';

async function termiiRequest(path: string, body: Record<string, unknown>): Promise<Response> {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) {
    throw new Error('TERMII_NOT_CONFIGURED');
  }

  return fetch(`${TERMII_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, ...body }),
  });
}

export async function sendPasswordResetOtp(phoneNumber: string, otp: string): Promise<boolean> {
  const normalizedPhone = phoneNumber.replace(/\s+/g, '');

  if (!process.env.TERMII_API_KEY) {
    console.log(`[Termii Dev] password reset OTP for ${normalizedPhone}: ${otp}`);
    return true;
  }

  try {
    const response = await termiiRequest('/sms/send', {
      to: normalizedPhone,
      from: TERMII_SENDER_ID,
      sms: `Your SharpWork password reset code is ${otp}. Valid for 10 minutes. Do not share this code.`,
      type: 'plain',
      channel: 'generic',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[Termii] Send failed:', errorBody);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Termii] Send error:', error);
    return false;
  }
}

export async function sendVerificationOtp(phoneNumber: string, otp: string): Promise<boolean> {
  const normalizedPhone = phoneNumber.replace(/\s+/g, '');

  if (!process.env.TERMII_API_KEY) {
    console.log(`[Termii Dev] verification OTP for ${normalizedPhone}: ${otp}`);
    return true;
  }

  try {
    const response = await termiiRequest('/sms/send', {
      to: normalizedPhone,
      from: TERMII_SENDER_ID,
      sms: `Your SharpWork verification code is ${otp}. Valid for 10 minutes. Do not share this code.`,
      type: 'plain',
      channel: 'generic',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[Termii] Send failed:', errorBody);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Termii] Send error:', error);
    return false;
  }
}
