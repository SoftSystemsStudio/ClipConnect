import type { NextApiRequest, NextApiResponse } from 'next';
import { optionalAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

interface AuthenticatedRequest extends NextApiRequest {
  user?: { id: number; role: string };
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const reviewId = parseInt(id as string, 10);

  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  if (req.method === 'GET') {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        client: { select: { id: true, name: true, profilePhotoUrl: true } },
        professional: { select: { id: true, name: true, profilePhotoUrl: true } },
      },
    });
    if (!review) return res.status(404).json({ error: 'Not found' });
    return res.json(review);
  }

  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });
  if (!review) return res.status(404).json({ error: 'Not found' });

  // Only the review author (client) can edit or delete
  if (review.clientId !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { rating, text } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const oldRating = review.rating;
    const newRating = rating ?? oldRating;

    // Update the review
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating !== undefined && { rating }),
        ...(text !== undefined && { text }),
      },
      include: {
        client: { select: { id: true, name: true, profilePhotoUrl: true } },
        professional: { select: { id: true, name: true, profilePhotoUrl: true } },
      },
    });

    // Update professional's rating if rating changed
    if (rating !== undefined && rating !== oldRating) {
      const proProfile = await prisma.professionalProfile.findUnique({
        where: { userId: review.professionalId },
      });
      if (proProfile && proProfile.reviewsCount > 0) {
        const currentSum = (proProfile.averageRating || 0) * proProfile.reviewsCount;
        const newAvg = (currentSum - oldRating + newRating) / proProfile.reviewsCount;
        await prisma.professionalProfile.update({
          where: { userId: review.professionalId },
          data: { averageRating: newAvg },
        });
      }
    }

    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    // Update professional's rating aggregates
    const proProfile = await prisma.professionalProfile.findUnique({
      where: { userId: review.professionalId },
    });
    if (proProfile && proProfile.reviewsCount > 0) {
      const newCount = proProfile.reviewsCount - 1;
      let newAvg = 0;
      if (newCount > 0) {
        const currentSum = (proProfile.averageRating || 0) * proProfile.reviewsCount;
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

  return res.status(405).json({ error: 'Method not allowed' });
}

export default optionalAuth(handler);
