import { prisma } from '../../db/prisma.js';

export function getAdminProfile(admin) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  };
}

function emptyQueueCounts() {
  return {
    waiting: 0,
    called: 0,
    done: 0,
    skipped: 0,
    total: 0,
  };
}

export async function getAdminOverview() {
  const activeEvent = await prisma.event.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { startAt: 'desc' },
    include: {
      eventFaculties: {
        include: {
          faculty: {
            include: {
              operators: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          faculty: {
            name: 'asc',
          },
        },
      },
    },
  });

  if (!activeEvent) {
    return {
      event: null,
      faculties: [],
      totals: emptyQueueCounts(),
    };
  }

  const ticketCounts = await prisma.queueTicket.groupBy({
    by: ['facultyId', 'status'],
    where: {
      eventId: activeEvent.id,
    },
    _count: {
      id: true,
    },
  });

  const countsByFaculty = new Map();

  for (const ticketCount of ticketCounts) {
    const counts = countsByFaculty.get(ticketCount.facultyId) || emptyQueueCounts();
    const statusKey = ticketCount.status.toLowerCase();
    const count = ticketCount._count.id;

    counts[statusKey] = count;
    counts.total += count;
    countsByFaculty.set(ticketCount.facultyId, counts);
  }

  const totals = emptyQueueCounts();

  const faculties = activeEvent.eventFaculties.map((eventFaculty) => {
    const counts = countsByFaculty.get(eventFaculty.facultyId) || emptyQueueCounts();

    totals.waiting += counts.waiting;
    totals.called += counts.called;
    totals.done += counts.done;
    totals.skipped += counts.skipped;
    totals.total += counts.total;

    return {
      id: eventFaculty.faculty.id,
      name: eventFaculty.faculty.name,
      code: eventFaculty.faculty.code,
      operator: eventFaculty.faculty.operators[0] || null,
      queue: counts,
    };
  });

  return {
    event: {
      id: activeEvent.id,
      name: activeEvent.name,
      status: activeEvent.status,
      startAt: activeEvent.startAt,
      endAt: activeEvent.endAt,
    },
    faculties,
    totals,
  };
}

export async function endEvent(eventId) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    const error = new Error('Event not found.');
    error.statusCode = 404;
    throw error;
  }

  if (event.status !== 'ACTIVE') {
    const error = new Error('Only active events can be ended.');
    error.statusCode = 400;
    throw error;
  }

  return prisma.event.update({
    where: { id: eventId },
    data: {
      status: 'ENDED',
      endAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      status: true,
      startAt: true,
      endAt: true,
    },
  });
}
