import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

async function handler(req: NextApiRequest & { user?: any }, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const user = req.user
  const { professionalId } = req.body
  const existing = await prisma.follow.findFirst({ where: { followerUserId: user.id, followedProfessionalId: professionalId } })
  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } })
    return res.json({ ok: true, following: false })
  }
  await prisma.follow.create({ data: { followerUserId: user.id, followedProfessionalId: professionalId } })
  return res.json({ ok: true, following: true })
}

export default requireAuth(handler)
