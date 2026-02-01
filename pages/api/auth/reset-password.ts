import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';
import { resetTokens } from './forgot-password';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Reset token is required' });
  }

  if (!password) {
    return res.status(400).json({ error: 'New password is required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  // Verify token
  const tokenData = resetTokens.get(token);

  if (!tokenData) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  if (tokenData.expiresAt < Date.now()) {
    resetTokens.delete(token);
    return res.status(400).json({ error: 'Reset token has expired' });
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: tokenData.email },
  });

  if (!user) {
    resetTokens.delete(token);
    return res.status(400).json({ error: 'User not found' });
  }

  // Update password
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Delete used token
  resetTokens.delete(token);

  return res.json({
    success: true,
    message: 'Password has been reset successfully',
  });
}
