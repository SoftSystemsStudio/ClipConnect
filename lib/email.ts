import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Email transporter - configure based on environment
const createTransporter = () => {
  // In production, use a real email service (SendGrid, AWS SES, etc.)
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // In development, use ethereal.email for testing
  // Or log to console if no SMTP configured
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });
  }

  return null;
};

const transporter = createTransporter();

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, text, html } = options;

  // If no transporter configured, log email to console (development)
  if (!transporter) {
    console.log('========== EMAIL (Development Mode) ==========');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log('==============================================');
    return true;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'ClipConnect <noreply@clipconnect.com>',
      to,
      subject,
      text,
      html: html || text,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Reset your ClipConnect password',
    text: `
You requested a password reset for your ClipConnect account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

- The ClipConnect Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">ClipConnect</h1>
  </div>
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
    <p>You requested a password reset for your ClipConnect account.</p>
    <p>Click the button below to reset your password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
    </div>
    <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>
    <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">- The ClipConnect Team</p>
  </div>
</body>
</html>
    `.trim(),
  });
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Verify your ClipConnect email',
    text: `
Welcome to ClipConnect!

Please verify your email address by clicking the link below:
${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

- The ClipConnect Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">ClipConnect</h1>
  </div>
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">Welcome to ClipConnect!</h2>
    <p>Thanks for signing up. Please verify your email address to get started.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Verify Email</a>
    </div>
    <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
    <p style="color: #6b7280; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">- The ClipConnect Team</p>
  </div>
</body>
</html>
    `.trim(),
  });
}

export async function sendNotificationEmail(
  email: string,
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `ClipConnect: ${title}`,
    text: `${title}\n\n${message}${actionUrl ? `\n\n${actionText || 'View'}: ${actionUrl}` : ''}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">ClipConnect</h1>
  </div>
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
    <p>${message}</p>
    ${actionUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${actionUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">${actionText || 'View'}</a>
    </div>
    ` : ''}
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">- The ClipConnect Team</p>
  </div>
</body>
</html>
    `.trim(),
  });
}
