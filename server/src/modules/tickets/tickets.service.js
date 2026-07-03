import crypto from 'node:crypto';
import { prisma } from '../../db/prisma.js';
import { emitQueueUpdated } from '../realtime/realtime.service.js';

export async function createTicket(eventId, facultyId) {

  // this whole section is to check if the faculty is available for the event and if the event is active
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

  if (!eventFaculty.faculty.isActive) {
    const error = new Error('Faculty is not active.');
    error.statusCode = 400;
    throw error;
  }

  // here we get the last ticket for this event and faculty, so we can generate the next ticket number
  const lastTicket = await prisma.queueTicket.findFirst({
    where: {
      eventId,
      facultyId,
    },
    orderBy: {
      sequenceNumber: 'desc',
    },
  });

  const sequenceNumber = lastTicket ? lastTicket.sequenceNumber + 1 : 1;

  const facultyCode = eventFaculty.faculty.code || 'GEN';
  const paddedNumber = String(sequenceNumber).padStart(3, '0');
  const ticketNumber = `${facultyCode}-${paddedNumber}`;

  const token = crypto.randomUUID();

  // here we create the ticket in the database
  const ticket = await prisma.queueTicket.create({
    data: {
      eventId,
      facultyId,
      ticketNumber,
      sequenceNumber,
      token,
    },
    select: {
      id: true,
      ticketNumber: true,
      sequenceNumber: true,
      token: true,
      status: true,
      createdAt: true,
      faculty: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  emitQueueUpdated(eventId, facultyId);

  return ticket;
}

export async function getTicketByToken(token) {
  const ticket = await prisma.queueTicket.findUnique({
    where: { token },
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

  if (!ticket) {
    const error = new Error('Ticket not found.');
    error.statusCode = 404;
    throw error;
  }

  const peopleAhead = await prisma.queueTicket.count({
    where: {
      eventId: ticket.eventId,
      facultyId: ticket.facultyId,
      status: 'WAITING',
      createdAt: {
        lt: ticket.createdAt,
      },
    },
  });

  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    sequenceNumber: ticket.sequenceNumber,
    token: ticket.token,
    status: ticket.status,
    createdAt: ticket.createdAt,
    calledAt: ticket.calledAt,
    peopleAhead,
    faculty: ticket.faculty,
    event: ticket.event,
  };
}
