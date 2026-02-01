import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

async function handler(
  req: NextApiRequest & { user?: { id: number } },
  res: NextApiResponse
) {
  if (req.method !== 'GET') return res.status(405).end();

  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const savedItems = await prisma.savedItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const postIds = savedItems
    .filter((item: { itemType: string }) => item.itemType === 'POST')
    .map((item: { itemId: number }) => item.itemId);
  const proIds = savedItems
    .filter((item: { itemType: string }) => item.itemType === 'PRO')
    .map((item: { itemId: number }) => item.itemId);

  const posts = await prisma.post.findMany({
    where: { id: { in: postIds } },
    include: { professional: { select: { name: true } } },
  });

  const professionals = await prisma.user.findMany({
    where: { id: { in: proIds } },
    include: { professional: true },
  });

  const formattedPosts = posts.map((post: any) => {
    let styleTags: string[] = [];
    try {
      styleTags = JSON.parse(post.styleTags);
    } catch {
      styleTags = [];
    }
    return {
      id: post.id,
      caption: post.caption,
      styleTags,
      professionalId: post.professionalId,
      professionalName: post.professional?.name,
    };
  });

  const formattedPros = professionals.map((user: any) => {
    let specialties: string[] = [];
    try {
      if (user.professional?.specialties) {
        specialties = JSON.parse(user.professional.specialties);
      }
    } catch {
      specialties = [];
    }
    return {
      id: user.id,
      name: user.name || 'Unknown',
      location: user.location,
      specialties,
      averageRating: user.professional?.averageRating,
    };
  });

  res.json({ posts: formattedPosts, professionals: formattedPros });
}

export default requireAuth(handler);
