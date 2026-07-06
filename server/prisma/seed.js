import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db/prisma.js";
import { generateEventSummary } from "../src/modules/admin/admin.service.js";

const developmentPassword = "password123";
const developmentEventName = "Monash Open Day Development";
const summaryDemoEventName = "Monash Open Day Summary Demo";

const faculties = [
  {
    code: "SASS",
    name: "School of Arts and Social Sciences",
    operatorEmail: "sass.operator@queuepilot.test",
    operatorName: "SASS Operator",
  },
  {
    code: "BUS",
    name: "School of Business",
    operatorEmail: "business.operator@queuepilot.test",
    operatorName: "Business Operator",
  },
  {
    code: "ENG",
    name: "School of Engineering",
    operatorEmail: "engineering.operator@queuepilot.test",
    operatorName: "Engineering Operator",
  },
  {
    code: "IT",
    name: "School of Information Technology",
    operatorEmail: "it.operator@queuepilot.test",
    operatorName: "IT Operator",
  },
  {
    code: "MED",
    name: "Jeffrey Cheah School of Medicine and Health Sciences",
    operatorEmail: "medicine.operator@queuepilot.test",
    operatorName: "Medicine Operator",
  },
  {
    code: "PHARM",
    name: "School of Pharmacy",
    operatorEmail: "pharmacy.operator@queuepilot.test",
    operatorName: "Pharmacy Operator",
  },
  {
    code: "SCI",
    name: "School of Science",
    operatorEmail: "science.operator@queuepilot.test",
    operatorName: "Science Operator",
  },
  {
    code: "GEN",
    name: "General Counselling",
    operatorEmail: "general.operator@queuepilot.test",
    operatorName: "General Counselling Operator",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(developmentPassword, 10);
  const seededFaculties = [];

  for (const faculty of faculties) {
    const seededFaculty = await prisma.faculty.upsert({
      where: { code: faculty.code },
      update: {
        name: faculty.name,
        isActive: true,
      },
      create: {
        code: faculty.code,
        name: faculty.name,
        isActive: true,
      },
    });

    seededFaculties.push(seededFaculty);

    await prisma.operator.upsert({
      where: { email: faculty.operatorEmail },
      update: {
        facultyId: seededFaculty.id,
        name: faculty.operatorName,
        passwordHash,
      },
      create: {
        facultyId: seededFaculty.id,
        name: faculty.operatorName,
        email: faculty.operatorEmail,
        passwordHash,
      },
    });
  }

  await prisma.admin.upsert({
    where: { email: "admin@queuepilot.test" },
    update: {
      name: "Development Admin",
      passwordHash,
    },
    create: {
      name: "Development Admin",
      email: "admin@queuepilot.test",
      passwordHash,
    },
  });

  const existingEvent = await prisma.event.findFirst({
    where: { name: developmentEventName },
  });

  const event = existingEvent
    ? await prisma.event.update({
        where: { id: existingEvent.id },
        data: {
          status: "ACTIVE",
          startAt: new Date("2026-07-01T00:00:00.000Z"),
          scheduledEndAt: new Date("2026-12-31T08:00:00.000Z"),
          endAt: null,
        },
      })
    : await prisma.event.create({
        data: {
          name: developmentEventName,
          status: "ACTIVE",
          startAt: new Date("2026-07-01T00:00:00.000Z"),
          scheduledEndAt: new Date("2026-12-31T08:00:00.000Z"),
        },
      });

  for (const faculty of seededFaculties) {
    await prisma.eventFaculty.upsert({
      where: {
        eventId_facultyId: {
          eventId: event.id,
          facultyId: faculty.id,
        },
      },
      update: {},
      create: {
        eventId: event.id,
        facultyId: faculty.id,
      },
    });
  }

  await prisma.event.deleteMany({
    where: { name: summaryDemoEventName },
  });

  const summaryDemoFaculties = seededFaculties.filter((faculty) =>
    ["SASS", "ENG", "GEN"].includes(faculty.code)
  );

  const summaryDemoEvent = await prisma.event.create({
    data: {
      name: summaryDemoEventName,
      status: "ENDED",
      startAt: new Date("2026-06-20T01:00:00.000Z"),
      scheduledEndAt: new Date("2026-06-20T08:00:00.000Z"),
      endAt: new Date("2026-06-20T08:15:00.000Z"),
      eventFaculties: {
        create: summaryDemoFaculties.map((faculty) => ({
          facultyId: faculty.id,
        })),
      },
    },
  });

  const summaryDemoTickets = [
    {
      code: "SASS",
      sequenceNumber: 1,
      status: "DONE",
      createdAt: "2026-06-20T01:10:00.000Z",
      calledAt: "2026-06-20T01:18:00.000Z",
    },
    {
      code: "SASS",
      sequenceNumber: 2,
      status: "SKIPPED",
      createdAt: "2026-06-20T01:15:00.000Z",
      calledAt: "2026-06-20T01:25:00.000Z",
    },
    {
      code: "ENG",
      sequenceNumber: 1,
      status: "DONE",
      createdAt: "2026-06-20T01:20:00.000Z",
      calledAt: "2026-06-20T01:31:00.000Z",
    },
    {
      code: "ENG",
      sequenceNumber: 2,
      status: "DONE",
      createdAt: "2026-06-20T01:23:00.000Z",
      calledAt: "2026-06-20T01:38:00.000Z",
    },
    {
      code: "GEN",
      sequenceNumber: 1,
      status: "CANCELLED",
      createdAt: "2026-06-20T01:30:00.000Z",
      calledAt: null,
    },
    {
      code: "GEN",
      sequenceNumber: 2,
      status: "DONE",
      createdAt: "2026-06-20T01:40:00.000Z",
      calledAt: "2026-06-20T01:52:00.000Z",
    },
  ];

  for (const ticket of summaryDemoTickets) {
    const faculty = seededFaculties.find((seededFaculty) => seededFaculty.code === ticket.code);

    await prisma.queueTicket.create({
      data: {
        eventId: summaryDemoEvent.id,
        facultyId: faculty.id,
        ticketNumber: `${ticket.code}-${String(ticket.sequenceNumber).padStart(3, "0")}`,
        sequenceNumber: ticket.sequenceNumber,
        token: crypto.randomUUID(),
        status: ticket.status,
        createdAt: new Date(ticket.createdAt),
        calledAt: ticket.calledAt ? new Date(ticket.calledAt) : null,
      },
    });
  }

  await generateEventSummary(summaryDemoEvent.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
