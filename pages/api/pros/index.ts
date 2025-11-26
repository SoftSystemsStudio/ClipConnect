import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const pros = await prisma.user.findMany({
    where: { role: 'PRO' },
    select: { id: true, name: true, location: true, professional: true }
  })
  const mapped = pros.map(p => ({ id: p.id, name: p.name, location: p.location, specialties: p.professional?.specialties || [] }))
  res.json(mapped)
}
