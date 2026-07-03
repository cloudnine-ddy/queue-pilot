import bcrypt from 'bcryptjs';
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
        where: {
          faculty: {
            isActive: true,
          },
        },
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
      isActive: eventFaculty.faculty.isActive,
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

function toAdminFaculty(faculty) {
  return {
    id: faculty.id,
    name: faculty.name,
    code: faculty.code,
    isActive: faculty.isActive,
    operator: faculty.operators?.[0] || null,
  };
}

function toAdminOperator(operator) {
  return {
    id: operator.id,
    name: operator.name,
    email: operator.email,
    faculty: operator.faculty,
    createdAt: operator.createdAt,
  };
}

export async function getAdminFaculties() {
  const faculties = await prisma.faculty.findMany({
    include: {
      operators: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { isActive: 'desc' },
      { name: 'asc' },
    ],
  });

  return faculties.map(toAdminFaculty);
}

export async function createFaculty({ name, code }) {
  const trimmedName = name?.trim();
  const trimmedCode = code?.trim().toUpperCase();

  if (!trimmedName || !trimmedCode) {
    const error = new Error('Faculty name and code are required.');
    error.statusCode = 400;
    throw error;
  }

  const faculty = await prisma.faculty.create({
    data: {
      name: trimmedName,
      code: trimmedCode,
      isActive: true,
    },
    include: {
      operators: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return toAdminFaculty(faculty);
}

export async function updateFaculty(facultyId, { name, code, isActive }) {
  const data = {};

  if (name !== undefined) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      const error = new Error('Faculty name cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    data.name = trimmedName;
  }

  if (code !== undefined) {
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      const error = new Error('Faculty code cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    data.code = trimmedCode;
  }

  if (isActive !== undefined) {
    data.isActive = Boolean(isActive);
  }

  if (Object.keys(data).length === 0) {
    const error = new Error('No faculty changes provided.');
    error.statusCode = 400;
    throw error;
  }

  try {
    const faculty = await prisma.faculty.update({
      where: { id: facultyId },
      data,
      include: {
        operators: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return toAdminFaculty(faculty);
  } catch (error) {
    if (error.code === 'P2025') {
      const notFoundError = new Error('Faculty not found.');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    throw error;
  }
}

export async function getAdminOperators() {
  const operators = await prisma.operator.findMany({
    include: {
      faculty: {
        select: {
          id: true,
          name: true,
          code: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return operators.map(toAdminOperator);
}

export async function createOperator({ name, email, password, facultyId }) {
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim().toLowerCase();

  if (!trimmedName || !trimmedEmail || !password || !facultyId) {
    const error = new Error('Operator name, email, password, and faculty are required.');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const operator = await prisma.operator.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
        facultyId,
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
          },
        },
      },
    });

    return toAdminOperator(operator);
  } catch (error) {
    if (error.code === 'P2002') {
      const conflictError = new Error('Operator email or faculty is already assigned.');
      conflictError.statusCode = 409;
      throw conflictError;
    }

    if (error.code === 'P2003') {
      const invalidFacultyError = new Error('Faculty not found.');
      invalidFacultyError.statusCode = 404;
      throw invalidFacultyError;
    }

    throw error;
  }
}

export async function updateOperator(operatorId, { name, email, facultyId }) {
  const data = {};

  if (name !== undefined) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      const error = new Error('Operator name cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    data.name = trimmedName;
  }

  if (email !== undefined) {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      const error = new Error('Operator email cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    data.email = trimmedEmail;
  }

  if (facultyId !== undefined) {
    data.facultyId = facultyId;
  }

  if (Object.keys(data).length === 0) {
    const error = new Error('No operator changes provided.');
    error.statusCode = 400;
    throw error;
  }

  try {
    const operator = await prisma.operator.update({
      where: { id: operatorId },
      data,
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
          },
        },
      },
    });

    return toAdminOperator(operator);
  } catch (error) {
    if (error.code === 'P2025') {
      const notFoundError = new Error('Operator not found.');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    if (error.code === 'P2002') {
      const conflictError = new Error('Operator email or faculty is already assigned.');
      conflictError.statusCode = 409;
      throw conflictError;
    }

    if (error.code === 'P2003') {
      const invalidFacultyError = new Error('Faculty not found.');
      invalidFacultyError.statusCode = 404;
      throw invalidFacultyError;
    }

    throw error;
  }
}

export async function resetOperatorPassword(operatorId, password) {
  if (!password) {
    const error = new Error('Password is required.');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const operator = await prisma.operator.update({
      where: { id: operatorId },
      data: { passwordHash },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
          },
        },
      },
    });

    return toAdminOperator(operator);
  } catch (error) {
    if (error.code === 'P2025') {
      const notFoundError = new Error('Operator not found.');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    throw error;
  }
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

export async function createActiveEvent(name, facultyIds) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    const error = new Error('Event name is required.');
    error.statusCode = 400;
    throw error;
  }

  const existingActiveEvent = await prisma.event.findFirst({
    where: { status: 'ACTIVE' },
    select: { id: true },
  });

  if (existingActiveEvent) {
    const error = new Error('End the active event before creating a new one.');
    error.statusCode = 409;
    throw error;
  }

  const uniqueFacultyIds = [...new Set(facultyIds || [])];

  if (uniqueFacultyIds.length === 0) {
    const error = new Error('Select at least one active faculty.');
    error.statusCode = 400;
    throw error;
  }

  const faculties = await prisma.faculty.findMany({
    where: {
      id: { in: uniqueFacultyIds },
      isActive: true,
    },
    select: { id: true },
  });

  if (faculties.length !== uniqueFacultyIds.length) {
    const error = new Error('Selected faculties must be active.');
    error.statusCode = 400;
    throw error;
  }

  return prisma.event.create({
    data: {
      name: trimmedName,
      status: 'ACTIVE',
      startAt: new Date(),
      eventFaculties: {
        create: faculties.map((faculty) => ({
          facultyId: faculty.id,
        })),
      },
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
