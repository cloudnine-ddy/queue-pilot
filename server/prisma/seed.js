import { prisma } from "../src/db/prisma.js";

const faculties = [
  {
    code: "SASS",
    name: "School of Arts and Social Sciences",
  },
  {
    code: "BUS",
    name: "School of Business",
  },
  {
    code: "ENG",
    name: "School of Engineering",
  },
  {
    code: "IT",
    name: "School of Information Technology",
  },
  {
    code: "MED",
    name: "Jeffrey Cheah School of Medicine and Health Sciences",
  },
  {
    code: "PHARM",
    name: "School of Pharmacy",
  },
  {
    code: "SCI",
    name: "School of Science",
  },
  {
    code: "GEN",
    name: "General Counselling",
  },
];

async function main() {
  for (const faculty of faculties) {
    await prisma.faculty.upsert({
      where: { code: faculty.code },
      update: { name: faculty.name },
      create: faculty,
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
