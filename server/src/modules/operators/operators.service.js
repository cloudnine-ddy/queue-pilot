import { prisma } from '../../db/prisma.js';

async function getActiveEventFaculty(eventId, facultyId) {
  const eventFaculty = await prisma.eventFaculty.findUnique({
    where: {
      eventId_facultyId: {
        eventId,
        facultyId,
      },
    },
    include: {
      event: true,
      faculty: true,
    },
  });

  if (!eventFaculty) {
    const error = new Error('Faculty is not available for this event.');
    error.statusCode = 404;
    throw error;
  }

  if (eventFaculty.event.status !== 'ACTIVE') {
    const error = new Error('Event is not active.');
    error.statusCode = 400;
    throw error;
  }

  return eventFaculty;
}

export async function getWaitingTickets(eventId, facultyId) {
  await getActiveEventFaculty(eventId, facultyId);

  return prisma.queueTicket.findMany({
    where: {
      eventId,
      facultyId,
      status: 'WAITING',
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      ticketNumber: true,
      sequenceNumber: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function callNextTicket(eventId, facultyId) {
  await getActiveEventFaculty(eventId, facultyId);

  const nextTicket = await prisma.queueTicket.findFirst({
    where: {
      eventId,
      facultyId,
      status: 'WAITING',
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (!nextTicket) {
    const error = new Error('No waiting tickets found.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.queueTicket.update({
    where: {
      id: nextTicket.id,
    },
    data: {
      status: 'CALLED',
      calledAt: new Date(),
    },
    select: {
      id: true,
      ticketNumber: true,
      sequenceNumber: true,
      status: true,
      createdAt: true,
      calledAt: true,
      faculty: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      event: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });
}
