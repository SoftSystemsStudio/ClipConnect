import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

interface AuthenticatedRequest extends NextApiRequest {
  user?: { id: number; role: string };
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notificationIds, markAll } = req.body;

  if (markAll) {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return res.json({ success: true, message: 'All notifications marked as read' });
  }

  if (!notificationIds || !Array.isArray(notificationIds)) {
    return res.status(400).json({ error: 'notificationIds array or markAll flag required' });
  }

  await prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      userId: user.id,
    },
    data: { isRead: true },
  });

  return res.json({ success: true });
}

export default requireAuth(handler);
