import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

async function handler(
  req: NextApiRequest & { user?: any },
  res: NextApiResponse
) {
  const user = req.user;

  if (req.method === 'GET') {
    // Get tools for a specific professional or current user
    const { proId } = req.query;
    const targetProId = proId ? parseInt(proId as string, 10) : undefined;

    // Find the professional profile
    const proProfile = await prisma.professionalProfile.findUnique({
      where: { userId: targetProId || user.id },
    });

    if (!proProfile) {
      return res.status(404).json({ error: 'Professional profile not found' });
    }

    const tools = await prisma.toolProduct.findMany({
      where: { professionalId: proProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(tools);
  }

  if (req.method === 'POST') {
    // Only PROs can create tools
    if (user.role !== 'PRO') {
      return res
        .status(403)
        .json({ error: 'Only professionals can add tools' });
    }

    const { name, category, description, affiliateUrl } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    // Get the professional profile
    const proProfile = await prisma.professionalProfile.findUnique({
      where: { userId: user.id },
    });

    if (!proProfile) {
      return res.status(404).json({ error: 'Professional profile not found' });
    }

    const tool = await prisma.toolProduct.create({
      data: {
        professionalId: proProfile.id,
        name,
        category,
        description: description || null,
        affiliateUrl: affiliateUrl || null,
      },
    });

    return res.status(201).json(tool);
  }

  if (req.method === 'DELETE') {
    const { toolId } = req.body;

    if (!toolId) {
      return res.status(400).json({ error: 'Tool ID is required' });
    }

    const tool = await prisma.toolProduct.findUnique({
      where: { id: toolId },
      include: { professional: true },
    });

    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    // Check ownership
    if (tool.professional.userId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.toolProduct.delete({ where: { id: toolId } });
    return res.json({ success: true });
  }

  return res.status(405).end();
}

export default requireAuth(handler);
