import { createTicket } from './tickets.service.js';

export async function createTicketHandler(req, res, next) {
  try {
    const { eventId, facultyId } = req.params;

    const ticket = await createTicket(eventId, facultyId);

    return res.status(201).json({ ticket });
  } catch (error) {
    return next(error);
  }
}