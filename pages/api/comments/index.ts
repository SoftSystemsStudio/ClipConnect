import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, optionalAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

interface AuthenticatedRequest extends NextApiRequest {
  user?: { id: number; role: string };
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { postId, limit = '20', offset = '0' } = req.query;

    if (!postId) {
      return res.status(400).json({ error: 'postId is required' });
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId: parseInt(postId as string, 10) },
        include: {
          user: {
            select: { id: true, name: true, profilePhotoUrl: true, role: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        take: Math.min(parseInt(limit as string, 10), 100),
        skip: parseInt(offset as string, 10),
      }),
      prisma.comment.count({
        where: { postId: parseInt(postId as string, 10) },
      }),
    ]);

    return res.json({ comments, total });
  }

  if (req.method === 'POST') {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { postId, text } = req.body;

    if (!postId || !text) {
      return res.status(400).json({ error: 'postId and text are required' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'Comment too long (max 1000 characters)' });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { professional: { select: { id: true, name: true } } },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: user.id,
        text: text.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, profilePhotoUrl: true, role: true },
        },
      },
    });

    // Create notification for post owner (if not commenting on own post)
    if (post.professionalId !== user.id) {
      const commenter = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true },
      });

      await prisma.notification.create({
        data: {
          userId: post.professionalId,
          type: 'comment',
          title: 'New Comment',
          message: `${commenter?.name || 'Someone'} commented on your post`,
          link: `/posts/${postId}`,
        },
      });
    }

    return res.status(201).json(comment);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default optionalAuth(handler);
