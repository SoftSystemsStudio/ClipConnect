import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method !== 'GET') return res.status(405).end()
  const uid = parseInt(id as string, 10)
  const user = await prisma.user.findUnique({ where: { id: uid }, include: { professional: true, client: true } })
  if (!user) return res.status(404).json({ error: 'Not found' })
  return res.json(user)
}
