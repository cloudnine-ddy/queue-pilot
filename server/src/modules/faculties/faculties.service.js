import { prisma } from "../../db/prisma.js";

export async function getEventFaculties(eventId) {
    const eventFaculties = await prisma.eventFaculty.findMany({
        // this means where: { eventId: eventId }
        where: {
            eventId,
            faculty: {
                isActive: true,
            },
        },

        // include means we go take the faculty data from the faculty table, and include it in the result
        // because this table only has the eventId and facultyId
        include: {
            faculty: true,
        },

        orderBy: {
            faculty: {
                name: 'asc',
            },
        },
    });

    // this will return an array of faculties
    // the other data will not be returned
    return eventFaculties.map((eventFaculty) => ({
        id: eventFaculty.faculty.id,
        name: eventFaculty.faculty.name,
        code: eventFaculty.faculty.code,
    }));
}
