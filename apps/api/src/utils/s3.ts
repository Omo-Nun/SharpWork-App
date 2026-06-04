import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export interface UploadResult {
  url: string;
  key: string;
}

function getExtension(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}

async function uploadToLocal(userId: string, buffer: Buffer, contentType: string): Promise<UploadResult> {
  const dir = path.join(process.cwd(), 'uploads', userId);
  await fs.mkdir(dir, { recursive: true });
  const key = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${getExtension(contentType)}`;
  const filePath = path.join(dir, key);
  await fs.writeFile(filePath, buffer);

  const baseUrl = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`;
  return { key, url: `${baseUrl}/uploads/${userId}/${key}` };
}

async function uploadToS3(userId: string, buffer: Buffer, contentType: string): Promise<UploadResult> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const bucket = process.env.AWS_S3_BUCKET!;
  const region = process.env.AWS_REGION || 'af-south-1';
  const key = `artisans/${userId}/${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${getExtension(contentType)}`;

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
    })
  );

  const cloudFront = process.env.AWS_CLOUDFRONT_URL;
  const url = cloudFront
    ? `${cloudFront.replace(/\/$/, '')}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { key, url };
}

export async function uploadArtisanAsset(
  userId: string,
  dataBase64: string,
  contentType: string
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error('Unsupported file type. Use JPEG, PNG, or WebP.');
  }

  const base64 = dataBase64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  if (buffer.length > MAX_BYTES) {
    throw new Error('File exceeds 5MB limit.');
  }

  const hasS3 =
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY;

  if (!hasS3) {
    console.log(`[S3 Dev] Stored upload locally for user ${userId}`);
    return uploadToLocal(userId, buffer, contentType);
  }

  return uploadToS3(userId, buffer, contentType);
}
