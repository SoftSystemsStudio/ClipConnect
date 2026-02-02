import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

interface AuthenticatedRequest extends NextApiRequest {
  user?: { id: number; role: string };
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { unreadOnly, limit = '20', offset = '0' } = req.query;

    const where = {
      userId: user.id,
      ...(unreadOnly === 'true' ? { isRead: false } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(parseInt(limit as string, 10), 100),
        skip: parseInt(offset as string, 10),
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    ]);

    return res.json({
      notifications,
      total,
      unreadCount,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
