import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '../../../lib/auth'
import prisma from '../../../lib/prisma'

async function handler(req: NextApiRequest & { user?: any }, res: NextApiResponse) {
  const user = req.user
  if (req.method !== 'PUT') return res.status(405).end()
  const { name, profilePhotoUrl, location, bio, specialties, hairTypesServed, priceRange, shopName, bookingUrl, minCutDurationMinutes, maxCutDurationMinutes } = req.body

  const updates:any = {}
  if (name !== undefined) updates.name = name
  if (profilePhotoUrl !== undefined) updates.profilePhotoUrl = profilePhotoUrl
  if (location !== undefined) updates.location = location

  // update user basic fields
  await prisma.user.update({ where: { id: user.id }, data: updates })

  if (user.role === 'PRO') {
    await prisma.professionalProfile.update({ where: { userId: user.id }, data: {
      bio,
      specialties: specialties ? JSON.stringify(specialties) : undefined,
      hairTypesServed: hairTypesServed ? JSON.stringify(hairTypesServed) : undefined,
      priceRange,
      shopName,
      bookingUrl,
      minCutDurationMinutes,
      maxCutDurationMinutes
    } })
  } else {
    await prisma.clientProfile.update({ where: { userId: user.id }, data: {
      hairTypes: hairTypesServed ? JSON.stringify(hairTypesServed) : undefined,
    } })
  }

  return res.json({ ok: true })
}

export default requireAuth(handler)
