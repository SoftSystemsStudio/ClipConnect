import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const pid = parseInt(id as string, 10)
  if (req.method === 'GET') {
    const post = await prisma.post.findUnique({ where: { id: pid } })
    if (!post) return res.status(404).json({ error: 'Not found' })
    const user = await getUserFromRequest(req as any)
    let liked = false
    if (user) {
      const like = await prisma.like.findUnique({ where: { userId_postId: { userId: user.id, postId: pid } } }).catch(()=>null)
      liked = !!like
    }
    return res.json({
      ...post,
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls as unknown as string) : [],
      styleTags: post.styleTags ? JSON.parse(post.styleTags as unknown as string) : [],
      hairTypeTags: post.hairTypeTags ? JSON.parse(post.hairTypeTags as unknown as string) : [],
      likedByCurrentUser: liked
    })
  }
  return res.status(405).end()
}
