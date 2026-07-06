import { prisma } from '../../db/prisma.js';
import { generateEventSummary } from '../admin/admin.service.js';

const detailRetentionDays = 30;

export async function deleteExpiredEventDetails(now = new Date()) {
  const cutoffDate = new Date(now.getTime() - detailRetentionDays * 24 * 60 * 60 * 1000);
  const expiredEvents = await prisma.event.findMany({
    where: {
      status: 'ENDED',
      endAt: {
        lte: cutoffDate,
      },
      detailDeletedAt: null,
    },
    select: {
      id: true,
      summary: {
        select: {
          id: true,
        },
      },
    },
  });

  for (const event of expiredEvents) {
    if (!event.summary) {
      await generateEventSummary(event.id);
    }

    await prisma.queueTicket.deleteMany({
      where: { eventId: event.id },
    });

    await prisma.eventFaculty.deleteMany({
      where: { eventId: event.id },
    });

    await prisma.event.update({
      where: { id: event.id },
      data: {
        detailDeletedAt: now,
      },
    });
  }

  return expiredEvents.length;
}

export async function endExpiredActiveEvents(now = new Date()) {
  const expiredEvents = await prisma.event.findMany({
    where: {
      status: 'ACTIVE',
      scheduledEndAt: {
        lte: now,
      },
    },
    select: {
      id: true,
      scheduledEndAt: true,
    },
  });

  for (const event of expiredEvents) {
    const result = await prisma.event.updateMany({
      where: {
        id: event.id,
        status: 'ACTIVE',
      },
      data: {
        status: 'ENDED',
        endAt: event.scheduledEndAt || now,
      },
    });

    if (result.count > 0) {
      await generateEventSummary(event.id);
    }
  }

  await deleteExpiredEventDetails(now);

  return expiredEvents.length;
}
