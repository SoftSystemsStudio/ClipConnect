import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

async function handler(req: NextApiRequest & { user?: any }, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const user = req.user
  const { mediaUrls, caption, styleTags, hairTypeTags, location, estimatedDurationMinutes } = req.body
  if (user.role !== 'PRO') return res.status(403).json({ error: 'Only professionals can create posts' })

  const post = await prisma.post.create({ data: {
    professionalId: user.id,
    mediaUrls: JSON.stringify(mediaUrls || []),
    caption,
    styleTags: JSON.stringify(styleTags || []),
    hairTypeTags: JSON.stringify(hairTypeTags || []),
    location,
    estimatedDurationMinutes: estimatedDurationMinutes || null
  } })
  res.status(201).json(post)
}

export default requireAuth(handler)
