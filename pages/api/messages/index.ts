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
    // Get conversations list (grouped by other user)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, profilePhotoUrl: true } },
        receiver: { select: { id: true, name: true, profilePhotoUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationsMap = new Map<number, {
      partnerId: number;
      partnerName: string | null;
      partnerPhoto: string | null;
      lastMessage: string;
      lastMessageAt: Date;
      unreadCount: number;
    }>();

    for (const msg of messages) {
      const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === user.id ? msg.receiver : msg.sender;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partnerId,
          partnerName: partner.name,
          partnerPhoto: partner.profilePhotoUrl,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }

      // Count unread
      if (msg.receiverId === user.id && !msg.isRead) {
        const conv = conversationsMap.get(partnerId)!;
        conv.unreadCount++;
      }
    }

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

    return res.json({ conversations });
  }

  if (req.method === 'POST') {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver and content are required' });
    }

    if (receiverId === user.id) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content: content.slice(0, 2000), // Limit message length
      },
      include: {
        sender: { select: { id: true, name: true, profilePhotoUrl: true } },
        receiver: { select: { id: true, name: true, profilePhotoUrl: true } },
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'message',
        title: 'New Message',
        message: `${req.user?.id ? (await prisma.user.findUnique({ where: { id: user.id } }))?.name || 'Someone' : 'Someone'} sent you a message`,
        link: `/messages/${user.id}`,
      },
    });

    return res.status(201).json(message);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
