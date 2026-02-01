import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

async function handler(
  req: NextApiRequest & { user?: any },
  res: NextApiResponse
) {
  const { id } = req.query;
  const reviewId = parseInt(id as string, 10);

  if (req.method === 'GET') {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        client: { select: { name: true } },
        professional: { select: { name: true } },
      },
    });
    if (!review) return res.status(404).json({ error: 'Not found' });
    return res.json(review);
  }

  if (req.method === 'DELETE') {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) return res.status(404).json({ error: 'Not found' });

    // Only the review author (client) can delete
    if (review.clientId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Update professional's rating aggregates
    const proProfile = await prisma.professionalProfile.findUnique({
      where: { userId: review.professionalId },
    });
    if (proProfile && proProfile.reviewsCount > 0) {
      const newCount = proProfile.reviewsCount - 1;
      let newAvg = 0;
      if (newCount > 0) {
        const currentSum =
          (proProfile.averageRating || 0) * proProfile.reviewsCount;
        newAvg = (currentSum - review.rating) / newCount;
      }
      await prisma.professionalProfile.update({
        where: { userId: review.professionalId },
        data: { reviewsCount: newCount, averageRating: newAvg },
      });
    }

    await prisma.review.delete({ where: { id: reviewId } });
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}

export default requireAuth(handler);
