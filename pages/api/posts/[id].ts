import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const pid = parseInt(id as string, 10);

  if (req.method === 'GET') {
    const post = await prisma.post.findUnique({ where: { id: pid } });
    if (!post) return res.status(404).json({ error: 'Not found' });
    const user = await getUserFromRequest(req as any);
    let liked = false;
    if (user) {
      const like = await prisma.like
        .findUnique({
          where: { userId_postId: { userId: user.id, postId: pid } },
        })
        .catch(() => null);
      liked = !!like;
    }
    return res.json({
      ...post,
      mediaUrls: post.mediaUrls
        ? JSON.parse(post.mediaUrls as unknown as string)
        : [],
      styleTags: post.styleTags
        ? JSON.parse(post.styleTags as unknown as string)
        : [],
      hairTypeTags: post.hairTypeTags
        ? JSON.parse(post.hairTypeTags as unknown as string)
        : [],
      likedByCurrentUser: liked,
    });
  }

  if (req.method === 'DELETE') {
    const user = await getUserFromRequest(req as any);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const post = await prisma.post.findUnique({ where: { id: pid } });
    if (!post) return res.status(404).json({ error: 'Not found' });

    // Only the post owner can delete
    if (post.professionalId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Delete related likes and saved items first
    await prisma.like.deleteMany({ where: { postId: pid } });
    await prisma.savedItem.deleteMany({
      where: { itemType: 'POST', itemId: pid },
    });

    // Delete the post
    await prisma.post.delete({ where: { id: pid } });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const user = await getUserFromRequest(req as any);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const post = await prisma.post.findUnique({ where: { id: pid } });
    if (!post) return res.status(404).json({ error: 'Not found' });

    // Only the post owner can edit
    if (post.professionalId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { caption, mediaUrls, styleTags, hairTypeTags, estimatedDurationMinutes, location } =
      req.body;

    const updateData: any = {};
    if (caption !== undefined) updateData.caption = caption;
    if (mediaUrls !== undefined)
      updateData.mediaUrls = JSON.stringify(mediaUrls);
    if (styleTags !== undefined)
      updateData.styleTags = JSON.stringify(styleTags);
    if (hairTypeTags !== undefined)
      updateData.hairTypeTags = JSON.stringify(hairTypeTags);
    if (estimatedDurationMinutes !== undefined)
      updateData.estimatedDurationMinutes = estimatedDurationMinutes;
    if (location !== undefined) updateData.location = location;

    const updated = await prisma.post.update({
      where: { id: pid },
      data: updateData,
    });

    return res.json({
      ...updated,
      mediaUrls: updated.mediaUrls
        ? JSON.parse(updated.mediaUrls as unknown as string)
        : [],
      styleTags: updated.styleTags
        ? JSON.parse(updated.styleTags as unknown as string)
        : [],
      hairTypeTags: updated.hairTypeTags
        ? JSON.parse(updated.hairTypeTags as unknown as string)
        : [],
    });
  }

  return res.status(405).end();
}
