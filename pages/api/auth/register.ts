import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, name, role } = req.body;
  if (!email || !password || !role)
    return res.status(400).json({ error: 'Missing fields' });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
    },
  });
  // create empty profile record depending on role
  if (role === 'PRO') {
    await prisma.professionalProfile.create({
      data: {
        userId: user.id,
        specialties: JSON.stringify([]),
        hairTypesServed: JSON.stringify([]),
        certifications: JSON.stringify([]),
      } as any,
    });
  } else {
    await prisma.clientProfile.create({
      data: {
        userId: user.id,
        hairTypes: JSON.stringify([]),
        usualStyles: JSON.stringify([]),
        haircutProfilePhotos: JSON.stringify([]),
      } as any,
    });
  }

  // Auto-login: set JWT cookie
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.setHeader(
    'Set-Cookie',
    `clipconnect_token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict`
  );

  res.status(201).json({ id: user.id, email: user.email, role: user.role });
}
