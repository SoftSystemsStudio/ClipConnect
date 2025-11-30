import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

function parseListParam(v: any) {
  if (!v) return []
  if (Array.isArray(v)) return v
  return String(v).split(',').map(s=>s.trim()).filter(Boolean)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const { city, styleTags, hairTypes, minRating, priceMin, priceMax, q, page } = req.query

  const styles = parseListParam(styleTags)
  const hair = parseListParam(hairTypes)

  const where:any = { role: 'PRO' }
  // location filter (simple contains match)
  if (city) where.location = { contains: String(city), mode: 'insensitive' }
  if (q) where.OR = [ { name: { contains: String(q), mode: 'insensitive' } }, { professional: { bio: { contains: String(q), mode: 'insensitive' } } } ]

  // build nested professional filters
  const profFilters:any[] = []
  if (styles.length) {
    for (const s of styles) profFilters.push({ professional: { specialties: { contains: String(s) } } })
  }
  if (hair.length) {
    for (const h of hair) profFilters.push({ professional: { hairTypesServed: { contains: String(h) } } })
  }
  if (minRating) profFilters.push({ professional: { averageRating: { gte: Number(minRating) } } })
  if (priceMin || priceMax) {
    // priceRange stored as string like "$30-$60" - do a contains match for priceMin
    if (priceMin) profFilters.push({ professional: { priceRange: { contains: String(priceMin) } } })
  }

  if (profFilters.length) where.AND = profFilters

  const pageNum = Math.max(1, parseInt((page as string) || '1', 10))
  const perPage = 20
  const results = await prisma.user.findMany({ where, include: { professional: true }, skip: (pageNum-1)*perPage, take: perPage })

  const mapped = results.map(r => ({
    id: r.id,
    name: r.name,
    location: r.location,
    specialties: r.professional?.specialties ? JSON.parse(r.professional.specialties as unknown as string) : [],
    hairTypesServed: r.professional?.hairTypesServed ? JSON.parse(r.professional.hairTypesServed as unknown as string) : [],
    averageRating: r.professional?.averageRating || 0,
    priceRange: r.professional?.priceRange || null
  }))

  res.json({ results: mapped, page: pageNum })
}
