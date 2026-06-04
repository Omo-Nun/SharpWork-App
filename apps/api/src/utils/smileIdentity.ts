import crypto from 'crypto';

const CONFIDENCE_THRESHOLD = 80;
const SANDBOX_BASE = 'https://testapi.smileidentity.com/v1';
const PRODUCTION_BASE = 'https://api.smileidentity.com/v1';

export interface LivenessResult {
  success: boolean;
  confidence: number;
  jobId?: string;
  resultCode?: string;
}

export interface NinVerifyResult {
  success: boolean;
  confidence: number;
  resultCode: string;
  jobId: string;
}

export interface BackgroundCheckResult {
  status: 'CLEAR' | 'FLAGGED' | 'PENDING';
  confidence: number;
}

function getConfig() {
  return {
    partnerId: process.env.SMILE_PARTNER_ID,
    apiKey: process.env.SMILE_API_KEY,
    baseUrl: process.env.SMILE_ENV === 'production' ? PRODUCTION_BASE : SANDBOX_BASE,
  };
}

function isDevMode(): boolean {
  const { partnerId, apiKey } = getConfig();
  return !partnerId || !apiKey;
}

export function generateSmileSignature(timestamp: string): string {
  const { partnerId, apiKey } = getConfig();
  if (!partnerId || !apiKey) return 'dev_signature';

  const hmac = crypto.createHmac('sha256', apiKey);
  hmac.update(timestamp, 'utf8');
  hmac.update(partnerId, 'utf8');
  hmac.update('sid_request', 'utf8');
  return hmac.digest('base64');
}

function confidenceFromResultCode(resultCode: string): number {
  if (resultCode === '1020') return 95;
  if (resultCode === '1021') return 85;
  if (resultCode === '1022') return 40;
  return 0;
}

export function passesConfidenceThreshold(confidence: number): boolean {
  return confidence >= CONFIDENCE_THRESHOLD;
}

export async function verifyNIN(params: {
  userId: string;
  nin: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}): Promise<NinVerifyResult> {
  if (!/^\d{11}$/.test(params.nin)) {
    return { success: false, confidence: 0, resultCode: 'invalid', jobId: '' };
  }

  if (isDevMode()) {
    console.log(`[Smile Identity Dev] NIN ${params.nin} verified for ${params.firstName} ${params.lastName}`);
    return { success: true, confidence: 92, resultCode: '1020', jobId: `dev_${crypto.randomUUID()}` };
  }

  const { partnerId, baseUrl } = getConfig();
  const jobId = crypto.randomUUID();
  const smileUserId = params.userId;
  const timestamp = new Date().toISOString();

  const body = {
    source_sdk: 'rest_api',
    source_sdk_version: '2.0.0',
    partner_id: partnerId,
    timestamp,
    signature: generateSmileSignature(timestamp),
    country: 'NG',
    id_type: 'NIN',
    id_number: params.nin,
    first_name: params.firstName,
    last_name: params.lastName,
    phone_number: params.phoneNumber || '',
    partner_params: {
      job_id: jobId,
      user_id: smileUserId,
    },
  };

  const response = await fetch(`${baseUrl}/id_verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  const resultCode = String(data?.ResultCode || data?.result?.ResultCode || '0000');
  const confidence = confidenceFromResultCode(resultCode);
  const success = ['1020', '1021'].includes(resultCode) && passesConfidenceThreshold(confidence);

  return {
    success,
    confidence,
    resultCode,
    jobId: String(data?.SmileJobID || jobId),
  };
}

export async function verifyFacialLiveness(params: {
  userId: string;
  jobId: string;
  selfieBase64?: string;
}): Promise<LivenessResult> {
  if (isDevMode()) {
    console.log('[Smile Identity Dev] Liveness passed at 88%');
    return { success: true, confidence: 88, jobId: params.jobId, resultCode: '0810' };
  }

  if (!params.selfieBase64) {
    return { success: false, confidence: 0, resultCode: 'no_image' };
  }

  const { partnerId, baseUrl } = getConfig();
  const timestamp = new Date().toISOString();

  const body = {
    partner_id: partnerId,
    timestamp,
    signature: generateSmileSignature(timestamp),
    user_id: params.userId,
    job_id: params.jobId,
    job_type: 1,
    partner_params: {
      job_id: params.jobId,
      user_id: params.userId,
    },
    image_details: [
      {
        image_type_id: 2,
        image: params.selfieBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    ],
  };

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  const resultCode = String(data?.result?.ResultCode || data?.ResultCode || '0000');
  const confidence = resultCode === '0810' ? 90 : resultCode === '0817' ? 82 : 50;

  return {
    success: passesConfidenceThreshold(confidence),
    confidence,
    jobId: params.jobId,
    resultCode,
  };
}

export async function runBackgroundCheck(params: {
  nin: string;
  bvn?: string;
}): Promise<BackgroundCheckResult> {
  if (isDevMode()) {
    console.log(`[Smile Identity Dev] Background check CLEAR for NIN ${params.nin}`);
    return { status: 'CLEAR', confidence: 90 };
  }

  const { partnerId, baseUrl } = getConfig();
  const timestamp = new Date().toISOString();
  const jobId = crypto.randomUUID();

  const body = {
    partner_id: partnerId,
    timestamp,
    signature: generateSmileSignature(timestamp),
    country: 'NG',
    id_type: params.bvn ? 'BVN' : 'NIN',
    id_number: params.bvn || params.nin,
    partner_params: {
      job_id: jobId,
      user_id: `bg_${params.nin}`,
    },
  };

  const response = await fetch(`${baseUrl}/id_verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  const resultCode = String(data?.ResultCode || '0000');
  const confidence = confidenceFromResultCode(resultCode);

  return {
    status: confidence >= CONFIDENCE_THRESHOLD ? 'CLEAR' : 'FLAGGED',
    confidence,
  };
}
