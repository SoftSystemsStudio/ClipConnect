import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

async function handler(req: NextApiRequest & { user?: any }, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const user = req.user
  if (user.role !== 'CLIENT') return res.status(403).json({ error: 'Only clients can post reviews' })
  const { professionalId, rating, text, actualDurationMinutes } = req.body
  const review = await prisma.review.create({ data: {
    professionalId,
    clientId: user.id,
    rating,
    text,
    actualDurationMinutes: actualDurationMinutes || null
  } })

  // update aggregates on professional profile
  const proProfile = await prisma.professionalProfile.findUnique({ where: { userId: professionalId } })
  if (proProfile) {
    const newCount = (proProfile.reviewsCount || 0) + 1
    const currentSum = (proProfile.averageRating || 0) * (proProfile.reviewsCount || 0)
    const newAvg = (currentSum + rating) / newCount
    await prisma.professionalProfile.update({ where: { userId: professionalId }, data: { reviewsCount: newCount, averageRating: newAvg } })
  }

  // update client's typicalCutDurationMinutes if provided
  if (actualDurationMinutes) {
    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: user.id } })
    if (clientProfile) {
      // compute average across client's reviews that have actualDurationMinutes
      const reviews = await prisma.review.findMany({ where: { clientId: user.id, actualDurationMinutes: { not: null } } })
      const durations = reviews.map(r => r.actualDurationMinutes || 0)
      const avg = Math.round(durations.reduce((a,b)=>a+b, 0) / durations.length)
      await prisma.clientProfile.update({ where: { userId: user.id }, data: { typicalCutDurationMinutes: avg } })
    }
  }

  return res.status(201).json(review)
}

export default requireAuth(handler)
