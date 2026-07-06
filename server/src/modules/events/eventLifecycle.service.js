import { prisma } from '../../db/prisma.js';
import { generateEventSummary } from '../admin/admin.service.js';

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

  return expiredEvents.length;
}
