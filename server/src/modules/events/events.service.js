import { prisma } from '../../db/prisma.js';
import { endExpiredActiveEvents } from './eventLifecycle.service.js';

export async function getActiveEvent() {
  await endExpiredActiveEvents();

  return prisma.event.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { startAt: 'desc' },
    
    // return these required fields
    select: {
      id: true,
      name: true,
      status: true,
      startAt: true,
      scheduledEndAt: true,
      endAt: true,
    },
  });
}
