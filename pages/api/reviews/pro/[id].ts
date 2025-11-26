import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const { id } = req.query
  const pid = parseInt(id as string, 10)
  const reviews = await prisma.review.findMany({ where: { professionalId: pid }, orderBy: { createdAt: 'desc' } })
  res.json(reviews)
}
