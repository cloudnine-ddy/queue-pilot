import { prisma } from '../../db/prisma.js';
import {
  emitQueueUpdated,
  emitTicketUpdated,
} from '../realtime/realtime.service.js';
import { endExpiredActiveEvents } from '../events/eventLifecycle.service.js';

// this function is used to convert the ticket object from the database
// to the format that we want to send to the operator
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

const operatorTicketSelect = {
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
};

// notice that this function is not exported, it is only used in this file
// why? because we are not calling this function through any api url
// we use it to check if the event and faculty are valid and active before we call the other functions
async function getActiveEventFaculty(eventId, facultyId) {
  await endExpiredActiveEvents();

  const eventFaculty = await prisma.eventFaculty.findUnique({
    where: {
      // because in the prisma schema we have a compound unique key for eventId and facultyId
      // so here we use is to find the record
      // if we write them separately, it will not work
      // e.g. if we write where: { eventId, facultyId }, it will not work
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

    // because this is a service function
    // we throw the error and let the controller handle it
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

  return eventFaculty;
}

export async function getWaitingTickets(eventId, facultyId) {
  // if the event and faculty is valid, only we move on
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

export async function getCalledTickets(eventId, facultyId) {
  await getActiveEventFaculty(eventId, facultyId);

  const tickets = await prisma.queueTicket.findMany({
    where: {
      eventId,
      facultyId,
      status: 'CALLED',
    },
    orderBy: {
      calledAt: 'asc',
    },
    select: operatorTicketSelect,
  });

  return tickets.map(toOperatorTicket);
}

// this function will update the status of the ticket to CALLED
// and return the ticket object, so it can be shown in the operator's screen
export async function callNextTicket(eventId, facultyId) {
  await getActiveEventFaculty(eventId, facultyId);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const nextTicket = await prisma.queueTicket.findFirst({
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
      },
    });

    if (!nextTicket) {
      const error = new Error('No waiting tickets found.');
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.queueTicket.updateMany({
      where: {
        id: nextTicket.id,
        status: 'WAITING',
      },
      data: {
        status: 'CALLED',
        calledAt: new Date(),
      },
    });

    if (result.count === 0) {
      continue;
    }

    const calledTicket = await prisma.queueTicket.findUnique({
      where: {
        id: nextTicket.id,
      },
      select: operatorTicketSelect,
    });

    emitQueueUpdated(calledTicket.eventId, calledTicket.facultyId);
    emitTicketUpdated(calledTicket.token);

    return toOperatorTicket(calledTicket);
  }

  const error = new Error('Queue changed while calling next ticket. Please try again.');
  error.statusCode = 409;
  throw error;
}

// this function is not exported also
// it check if the ticket is in CALLED status, if not, it will throw an error
// after that, we will update the status of the ticket to the new status, and return the ticket object
async function updateCalledTicketStatus(ticketId, operatorFacultyId, status) {
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

  if (ticket.facultyId !== operatorFacultyId) {
    const error = new Error('You cannot update tickets from another faculty.');
    error.statusCode = 403;
    throw error;
  }

  if (!ticket.faculty.isActive) {
    const error = new Error('Faculty is not active.');
    error.statusCode = 400;
    throw error;
  }

  const updatedTicket = await prisma.queueTicket.update({
    where: { id: ticketId },
    data: { status },
    select: operatorTicketSelect,
  });

  emitQueueUpdated(updatedTicket.eventId, updatedTicket.facultyId);
  emitTicketUpdated(updatedTicket.token);

  return toOperatorTicket(updatedTicket);
}

// here we export the function, and set the status to DONE
// so once we call this function, the ticket will be marked as DONE
export async function completeTicket(ticketId, operatorFacultyId) {
  return updateCalledTicketStatus(ticketId, operatorFacultyId, 'DONE');
}

export async function skipTicket(ticketId, operatorFacultyId) {
  return updateCalledTicketStatus(ticketId, operatorFacultyId, 'SKIPPED');
}
