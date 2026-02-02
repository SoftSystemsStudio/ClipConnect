import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { rateLimit } from '../../../lib/middleware/rate-limit';
import { createAuditLog } from '../../../lib/audit';

// Rate limiting: 5 attempts per 15 minutes
const resetPasswordRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many reset attempts. Please try again later.',
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  // Find token in database
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  if (resetToken.usedAt) {
    return res.status(400).json({ error: 'This reset token has already been used' });
  }

  if (resetToken.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Reset token has expired' });
  }

  // Update password
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });

  // Mark token as used
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() },
  });

  await createAuditLog({
    userId: resetToken.userId,
    action: 'PASSWORD_RESET_COMPLETED',
    entity: 'User',
    entityId: resetToken.userId,
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  return res.json({
    success: true,
    message: 'Password has been reset successfully',
  });
}

export default resetPasswordRateLimit(handler);
