import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { sendNotificationEmail } from '../../../lib/email';

interface AuthenticatedRequest extends NextApiRequest {
  user?: { id: number; role: string };
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { status, role = 'client' } = req.query;

    const where = {
      ...(role === 'client'
        ? { clientId: user.id }
        : { professionalId: user.id }),
      ...(status && { status: status as string }),
    };

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, profilePhotoUrl: true, email: true } },
        professional: {
          select: {
            id: true,
            name: true,
            profilePhotoUrl: true,
            email: true,
            professional: { select: { shopName: true, shopAddress: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return res.json({ bookings });
  }

  if (req.method === 'POST') {
    const { professionalId, scheduledAt, duration, notes } = req.body;

    if (!professionalId || !scheduledAt || !duration) {
      return res.status(400).json({ error: 'professionalId, scheduledAt, and duration are required' });
    }

    // Validate professional exists and is a PRO
    const professional = await prisma.user.findUnique({
      where: { id: professionalId },
      include: { professional: true },
    });

    if (!professional || professional.role !== 'PRO') {
      return res.status(404).json({ error: 'Professional not found' });
    }

    if (!professional.professional?.acceptingClients) {
      return res.status(400).json({ error: 'This professional is not accepting new clients' });
    }

    // Check for scheduling conflicts
    const scheduledDate = new Date(scheduledAt);
    const endDate = new Date(scheduledDate.getTime() + duration * 60 * 1000);

    const conflicts = await prisma.booking.findMany({
      where: {
        professionalId,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            scheduledAt: { gte: scheduledDate, lt: endDate },
          },
          {
            scheduledAt: {
              lt: scheduledDate,
            },
            // This is a simplified check - in production you'd want more sophisticated conflict detection
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      return res.status(400).json({ error: 'This time slot is not available' });
    }

    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        professionalId,
        scheduledAt: scheduledDate,
        duration,
        notes,
        status: 'pending',
      },
      include: {
        client: { select: { id: true, name: true, profilePhotoUrl: true } },
        professional: { select: { id: true, name: true, profilePhotoUrl: true } },
      },
    });

    // Create notification for professional
    const client = await prisma.user.findUnique({ where: { id: user.id } });
    await prisma.notification.create({
      data: {
        userId: professionalId,
        type: 'booking',
        title: 'New Booking Request',
        message: `${client?.name || 'A client'} requested an appointment for ${scheduledDate.toLocaleDateString()}`,
        link: '/bookings',
      },
    });

    // Send email notification to professional
    if (professional.email) {
      await sendNotificationEmail(
        professional.email,
        'New Booking Request',
        `${client?.name || 'A client'} has requested an appointment on ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString()}.`,
        `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
        'View Booking'
      );
    }

    return res.status(201).json(booking);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
