import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { createAuditLog } from '../../../lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  // Find token in database
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationToken) {
    return res.status(400).json({ error: 'Invalid verification token' });
  }

  if (verificationToken.usedAt) {
    return res.status(400).json({ error: 'This token has already been used' });
  }

  if (verificationToken.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Verification token has expired' });
  }

  // Mark user as verified
  await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerified: true },
  });

  // Mark token as used
  await prisma.emailVerificationToken.update({
    where: { id: verificationToken.id },
    data: { usedAt: new Date() },
  });

  await createAuditLog({
    userId: verificationToken.userId,
    action: 'EMAIL_VERIFIED',
    entity: 'User',
    entityId: verificationToken.userId,
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  return res.json({
    success: true,
    message: 'Email verified successfully',
  });
}
