import { prisma } from '../../db/prisma.js';
import {
  emitQueueUpdated,
  emitTicketUpdated,
} from '../realtime/realtime.service.js';

function toOperatorTicket(ticket) {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    sequenceNumber: ticket.sequenceNumber,
    status: ticket.status,
    createdAt: ticket.createdAt,
    calledAt: ticket.calledAt,
    faculty: ticket.faculty,
    event: ticket.event,
  };
}

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

  const calledTicket = await prisma.queueTicket.update({
    where: {
      id: nextTicket.id,
    },
    data: {
      status: 'CALLED',
      calledAt: new Date(),
    },
    select: {
      id: true,
      eventId: true,
      facultyId: true,
      ticketNumber: true,
      sequenceNumber: true,
      token: true,
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

  emitQueueUpdated(calledTicket.eventId, calledTicket.facultyId);
  emitTicketUpdated(calledTicket.token);

  return toOperatorTicket(calledTicket);
}

async function updateCalledTicketStatus(ticketId, status) {
  const ticket = await prisma.queueTicket.findUnique({
    where: { id: ticketId },
    include: {
      faculty: true,
      event: true,
    },
  });

  if (!ticket) {
    const error = new Error('Ticket not found.');
    error.statusCode = 404;
    throw error;
  }

  if (ticket.status !== 'CALLED') {
    const error = new Error('Only called tickets can be updated.');
    error.statusCode = 400;
    throw error;
  }

  const updatedTicket = await prisma.queueTicket.update({
    where: { id: ticketId },
    data: { status },
    select: {
      id: true,
      eventId: true,
      facultyId: true,
      ticketNumber: true,
      sequenceNumber: true,
      token: true,
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

  emitQueueUpdated(updatedTicket.eventId, updatedTicket.facultyId);
  emitTicketUpdated(updatedTicket.token);

  return toOperatorTicket(updatedTicket);
}

export async function completeTicket(ticketId) {
  return updateCalledTicketStatus(ticketId, 'DONE');
}

export async function skipTicket(ticketId) {
  return updateCalledTicketStatus(ticketId, 'SKIPPED');
}
