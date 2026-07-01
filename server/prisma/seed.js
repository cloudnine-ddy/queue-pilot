import bcrypt from "bcryptjs";
import { prisma } from "../src/db/prisma.js";

const developmentPassword = "password123";
const developmentEventName = "Monash Open Day Development";

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
      update: { name: faculty.name },
      create: {
        code: faculty.code,
        name: faculty.name,
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
          endAt: null,
        },
      })
    : await prisma.event.create({
        data: {
          name: developmentEventName,
          status: "ACTIVE",
          startAt: new Date("2026-07-01T00:00:00.000Z"),
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
