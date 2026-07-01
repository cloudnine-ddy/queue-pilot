import { prisma } from "../../db/prisma.js";

export async function getEventFaculties(eventId) {
    const eventFaculties = await prisma.eventFaculty.findMany({
        where: { eventId },
        include: {
            faculty: true,
        },
        orderBy: {
            faculty: {
                name: 'asc',
            },
        },
    });

    return eventFaculties.map((eventFaculty) => eventFaculty.faculty);
}
