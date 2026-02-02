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

  const { id } = req.query;
  const bookingId = parseInt(id as string, 10);

  if (isNaN(bookingId)) {
    return res.status(400).json({ error: 'Invalid booking ID' });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      client: { select: { id: true, name: true, email: true } },
      professional: { select: { id: true, name: true, email: true } },
    },
  });

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Only client or professional can access booking
  if (booking.clientId !== user.id && booking.professionalId !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'GET') {
    return res.json(booking);
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { status, scheduledAt, duration, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Only professional can confirm/complete bookings
    if ((status === 'confirmed' || status === 'completed') && booking.professionalId !== user.id) {
      return res.status(403).json({ error: 'Only the professional can confirm or complete bookings' });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(status && { status }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(duration && { duration }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        client: { select: { id: true, name: true, profilePhotoUrl: true } },
        professional: { select: { id: true, name: true, profilePhotoUrl: true } },
      },
    });

    // Send notifications based on status change
    if (status) {
      const notifyUserId = user.id === booking.clientId ? booking.professionalId : booking.clientId;
      const notifyEmail = user.id === booking.clientId ? booking.professional.email : booking.client.email;
      const actorName = user.id === booking.clientId ? booking.client.name : booking.professional.name;

      const statusMessages: Record<string, string> = {
        confirmed: `Your booking has been confirmed by ${actorName}`,
        cancelled: `Your booking has been cancelled by ${actorName}`,
        completed: `Your booking has been marked as completed`,
      };

      if (statusMessages[status]) {
        await prisma.notification.create({
          data: {
            userId: notifyUserId,
            type: 'booking',
            title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: statusMessages[status],
            link: '/bookings',
          },
        });

        if (notifyEmail) {
          await sendNotificationEmail(
            notifyEmail,
            `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            statusMessages[status],
            `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
            'View Booking'
          );
        }
      }
    }

    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    // Only allow cancellation if pending
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Can only delete pending bookings' });
    }

    await prisma.booking.delete({ where: { id: bookingId } });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAuth(handler);
