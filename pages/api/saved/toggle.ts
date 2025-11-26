import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

async function handler(req: NextApiRequest & { user?: any }, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const user = req.user
  const { itemType, itemId } = req.body
  const existing = await prisma.savedItem.findFirst({ where: { userId: user.id, itemType, itemId } })
  if (existing) {
    await prisma.savedItem.delete({ where: { id: existing.id } })
    return res.json({ ok: true, saved: false })
  }
  await prisma.savedItem.create({ data: { userId: user.id, itemType, itemId } })
  return res.json({ ok: true, saved: true })
}

export default requireAuth(handler)
