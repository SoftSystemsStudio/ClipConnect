import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

interface AuthenticatedRequest extends NextApiRequest {
  user?: { id: number; role: string };
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const commentId = parseInt(id as string, 10);

  if (isNaN(commentId)) {
    return res.status(400).json({ error: 'Invalid comment ID' });
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { professionalId: true } } },
  });

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    // Only comment author can edit
    if (comment.userId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'Comment too long (max 1000 characters)' });
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { text: text.trim() },
      include: {
        user: {
          select: { id: true, name: true, profilePhotoUrl: true, role: true },
        },
      },
    });

    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    // Comment author or post owner can delete
    if (comment.userId !== user.id && comment.post.professionalId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
