import { prisma } from '../../db/prisma.js';

export async function getActiveEvent() {
  return prisma.event.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { startAt: 'desc' },
    select: {
      id: true,
      name: true,
      status: true,
      startAt: true,
      endAt: true,
    },
  });
}
