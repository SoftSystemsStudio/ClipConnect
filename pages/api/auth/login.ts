import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';
import { rateLimit } from '../../../lib/middleware/rate-limit';
import { createAuditLog } from '../../../lib/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Strict rate limiting for login: 5 attempts per 15 minutes
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Missing fields' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await createAuditLog({
      action: 'LOGIN_FAILED',
      entity: 'User',
      details: { email, reason: 'User not found' },
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await createAuditLog({
      userId: user.id,
      action: 'LOGIN_FAILED',
      entity: 'User',
      entityId: user.id,
      details: { reason: 'Invalid password' },
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set cookie with Secure flag in production
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `clipconnect_token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict${secure}`
  );

  await createAuditLog({
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    entity: 'User',
    entityId: user.id,
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}

export default loginRateLimit(handler);
