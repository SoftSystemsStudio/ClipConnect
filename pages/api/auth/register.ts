import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';
import { sendVerificationEmail } from '../../../lib/email';
import { rateLimit } from '../../../lib/middleware/rate-limit';
import { createAuditLog } from '../../../lib/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Rate limiting: 5 registrations per hour per IP
const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many registration attempts. Please try again later.',
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password, name, role } = req.body;

  if (!email || !password || !role)
    return res.status(400).json({ error: 'Missing fields' });

  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  if (!['PRO', 'CLIENT'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
      emailVerified: false,
    },
  });

  // Create empty profile record depending on role
  if (role === 'PRO') {
    await prisma.professionalProfile.create({
      data: {
        userId: user.id,
        specialties: JSON.stringify([]),
        hairTypesServed: JSON.stringify([]),
        certifications: JSON.stringify([]),
      },
    });
  } else {
    await prisma.clientProfile.create({
      data: {
        userId: user.id,
        hairTypes: JSON.stringify([]),
        usualStyles: JSON.stringify([]),
        haircutProfilePhotos: JSON.stringify([]),
      },
    });
  }

  // Create email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token: verificationToken,
      expiresAt,
    },
  });

  // Send verification email
  await sendVerificationEmail(email, verificationToken);

  // Auto-login: set JWT cookie
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `clipconnect_token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict${secure}`
  );

  await createAuditLog({
    userId: user.id,
    action: 'USER_REGISTERED',
    entity: 'User',
    entityId: user.id,
    details: { role },
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json({ id: user.id, email: user.email, role: user.role });
}

export default registerRateLimit(handler);
