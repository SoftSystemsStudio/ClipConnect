import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';
import { sendPasswordResetEmail } from '../../../lib/email';
import { rateLimit } from '../../../lib/middleware/rate-limit';
import { createAuditLog } from '../../../lib/audit';
import { isValidEmail, normalizeEmail } from '../../../lib/validation';

// Strict rate limiting: 3 requests per hour
const forgotPasswordRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests. Please try again later.',
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Validate and normalize email
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    });
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate any existing tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Store token in database
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  // Send email
  await sendPasswordResetEmail(email, token);

  await createAuditLog({
    userId: user.id,
    action: 'PASSWORD_RESET_REQUESTED',
    entity: 'User',
    entityId: user.id,
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  return res.json({
    success: true,
    message: 'If an account exists, a reset link has been sent.',
  });
}

export default forgotPasswordRateLimit(handler);
