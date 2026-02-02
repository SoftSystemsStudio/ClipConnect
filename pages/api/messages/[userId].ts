import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

interface AuthenticatedRequest extends NextApiRequest {
  user?: { id: number; role: string };
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { userId } = req.query;
  const otherUserId = parseInt(userId as string, 10);

  if (isNaN(otherUserId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (req.method === 'GET') {
    const { cursor, limit = '50' } = req.query;
    const take = Math.min(parseInt(limit as string, 10), 100);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, profilePhotoUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { cursor: { id: parseInt(cursor as string, 10) }, skip: 1 } : {}),
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    // Get other user info
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, name: true, profilePhotoUrl: true, role: true },
    });

    return res.json({
      messages: messages.reverse(), // Return in chronological order
      otherUser,
      nextCursor: messages.length === take ? messages[0]?.id : null,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
