import jwt from 'jsonwebtoken'
import { NextApiRequest } from 'next'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export async function getUserFromRequest(req: NextApiRequest) {
  const cookie = req.headers.cookie
  if (!cookie) return null
  const match = cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('clipconnect_token='))
  if (!match) return null
  const token = match.split('=')[1]
  try {
    const payload:any = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    return user
  } catch (e) {
    return null
  }
}

export function requireAuth(handler:any) {
  return async (req:any, res:any) => {
    const user = await getUserFromRequest(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    req.user = user
    return handler(req, res)
  }
}
