import { getEventFaculties } from "./faculties.service.js";

export async function getEventFacultiesHandler(req, res, next) {
    try {
        const { eventId } = req.params;

        const faculties = await getEventFaculties(eventId);

        return res.json({ faculties });

    }
    catch (error) {
        return next(error);
    }

}