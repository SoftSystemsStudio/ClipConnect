import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })

  const parsed = posts.map((p: any) => ({
    ...p,
    mediaUrls: p.mediaUrls ? JSON.parse(p.mediaUrls as unknown as string) : [],
    styleTags: p.styleTags ? JSON.parse(p.styleTags as unknown as string) : [],
    hairTypeTags: p.hairTypeTags ? JSON.parse(p.hairTypeTags as unknown as string) : []
  }))

  const user = await getUserFromRequest(req as any)
  if (!user) {
    return res.json(parsed)
  }

  const postIds = posts.map((p: any) => p.id)
  const likes = await prisma.like.findMany({ where: { userId: user.id, postId: { in: postIds } } })
  const saved = await prisma.savedItem.findMany({ where: { userId: user.id, itemType: 'POST', itemId: { in: postIds } } })

  const likedSet = new Set(likes.map(l => l.postId))
  const savedSet = new Set(saved.map(s => s.itemId))

  const mapped = parsed.map(p => ({
    ...p,
    likedByCurrentUser: likedSet.has(p.id),
    savedByCurrentUser: savedSet.has(p.id)
  }))

  res.json(mapped)
}
