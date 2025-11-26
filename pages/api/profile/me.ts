import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

async function handler(req: NextApiRequest & { user?: any }, res: NextApiResponse) {
  const user = req.user
  if (req.method === 'GET') {
    const profile = await prisma.user.findUnique({ where: { id: user.id }, include: { professional: true, client: true } })
    return res.json(profile)
  }
  return res.status(405).end()
}

export default requireAuth(handler)
