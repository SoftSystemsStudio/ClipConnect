import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';

// In-memory store for reset tokens (use Redis in production)
// Maps token -> { email, expiresAt }
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (data.expiresAt < now) {
      resetTokens.delete(token);
    }
  }
}, 5 * 60 * 1000);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    });
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  // Store token
  resetTokens.set(token, { email, expiresAt });

  // In production, send email here
  // For development, log the reset URL
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  if (process.env.NODE_ENV === 'development') {
    console.log('Password reset URL:', resetUrl);
  }

  // TODO: Implement email sending
  // await sendEmail({
  //   to: email,
  //   subject: 'Reset your password',
  //   body: `Click here to reset your password: ${resetUrl}`,
  // });

  return res.json({
    success: true,
    message: 'If an account exists, a reset link has been sent.',
    // Only include token in development for testing
    ...(process.env.NODE_ENV === 'development' && { token }),
  });
}

// Export for use in reset-password endpoint
export { resetTokens };
