import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

async function handler(
  req: NextApiRequest & { user?: any },
  res: NextApiResponse
) {
  if (req.method !== 'GET') return res.status(405).end();

  const user = req.user;
  const { userId, type } = req.query;

  // If userId is provided, get that user's followers/following
  // Otherwise, get the current user's
  const targetUserId = userId ? parseInt(userId as string, 10) : user.id;

  if (type === 'followers') {
    // Get users who follow this user (for professionals)
    const followers = await prisma.follow.findMany({
      where: { followedProfessionalId: targetUserId },
      include: {
        follower: {
          select: { id: true, name: true, profilePhotoUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      count: followers.length,
      users: followers.map((f: any) => f.follower),
    });
  }

  if (type === 'following') {
    // Get professionals this user follows
    const following = await prisma.follow.findMany({
      where: { followerUserId: targetUserId },
      include: {
        followedProfessional: {
          select: {
            id: true,
            name: true,
            profilePhotoUrl: true,
            professional: {
              select: { averageRating: true, specialties: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      count: following.length,
      users: following.map((f: any) => ({
        ...f.followedProfessional,
        specialties: f.followedProfessional.professional?.specialties
          ? JSON.parse(f.followedProfessional.professional.specialties)
          : [],
        averageRating: f.followedProfessional.professional?.averageRating || 0,
      })),
    });
  }

  // Default: return both counts
  const followersCount = await prisma.follow.count({
    where: { followedProfessionalId: targetUserId },
  });
  const followingCount = await prisma.follow.count({
    where: { followerUserId: targetUserId },
  });

  return res.json({
    followers: followersCount,
    following: followingCount,
  });
}

export default requireAuth(handler);
