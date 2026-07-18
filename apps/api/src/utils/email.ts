import sgMail from '@sendgrid/mail';
import { getWebAppUrl } from '../config/env';

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@sharpwork.com';
let isSendGridConfigured = false;

function configureSendGrid(): boolean {
  if (isSendGridConfigured) return true;
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return false;
  sgMail.setApiKey(apiKey);
  isSendGridConfigured = true;
  return true;
}

export async function sendVerificationEmail(
  to: string,
  token: string,
  firstName: string,
  webAppUrl?: string
): Promise<void> {
  const verifyUrl = `${webAppUrl || getWebAppUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`;
  const subject = 'Verify your SharpWork email';
  const html = `
    <div style="font-family: Poppins, Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <h1 style="color: #007A52;">Welcome to SharpWork</h1>
      <p>Hi ${firstName},</p>
      <p>Thanks for signing up. Please verify your email address to activate your account and reduce spam on our marketplace.</p>
      <p style="margin: 32px 0;">
        <a href="${verifyUrl}" style="background: #007A52; color: #fff; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: bold;">
          Verify Email Address
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">This link expires in 24 hours. If you did not create an account, you can ignore this email.</p>
      <p style="color: #999; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
    </div>
  `;
  const text = `Hi ${firstName},\n\nVerify your SharpWork account: ${verifyUrl}\n\nThis link expires in 24 hours.`;

<<<<<<< HEAD
  const isConfigured = configureSendGrid();
  if (!isConfigured) {
=======
  if (!configureSendGrid()) {
>>>>>>> 692263da91a95f3adee72c4f0ae332c9e935c06d
    console.log(`[Email Dev] Verification email for ${to}`);
    console.log(`[Email Dev] Verify URL: ${verifyUrl}`);
    return;
  }

  await sgMail.send({
    to,
    from: FROM_EMAIL,
    subject,
    html,
    text,
  });
}

