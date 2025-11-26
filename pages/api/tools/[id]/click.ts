import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id } = req.query
  const tid = parseInt(id as string, 10)
  const tool = await prisma.toolProduct.update({ where: { id: tid }, data: { clickCount: { increment: 1 } } }).catch(()=>null)
  if (!tool) return res.status(404).json({ error: 'Not found' })
  return res.json({ ok: true, clickCount: tool.clickCount })
}
