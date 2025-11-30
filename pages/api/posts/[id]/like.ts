import prisma from '../../../../lib/prisma'
import { requireAuth } from '../../../../lib/auth'

async function handler(req:any, res:any) {
  const { id } = req.query
  const pid = parseInt(id as string, 10)
  if (req.method !== 'POST') return res.status(405).end()
  const user = req.user
  // toggle like
  const existing = await prisma.like.findUnique({ where: { userId_postId: { userId: user.id, postId: pid } } }).catch(()=>null)
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
    const post = await prisma.post.update({ where: { id: pid }, data: { likeCount: { decrement: 1 } } })
    return res.json({ ok: true, liked: false, likeCount: post.likeCount })
  }
  await prisma.like.create({ data: { userId: user.id, postId: pid } })
  const post = await prisma.post.update({ where: { id: pid }, data: { likeCount: { increment: 1 } } })
  return res.json({ ok: true, liked: true, likeCount: post.likeCount })
}

export default requireAuth(handler)

