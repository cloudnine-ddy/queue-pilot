import { callNextTicket } from './operators.service.js';

export async function callNextTicketHandler(req, res, next) {
  try {
    const { eventId, facultyId } = req.params;

    const ticket = await callNextTicket(eventId, facultyId);

    return res.json({ ticket });
  } catch (error) {
    return next(error);
  }
}
