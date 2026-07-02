import {
  callNextTicket,
  completeTicket,
  getWaitingTickets,
  skipTicket,
} from './operators.service.js';

export async function getWaitingTicketsHandler(req, res, next) {
  try {
    const { eventId, facultyId } = req.params;

    const tickets = await getWaitingTickets(eventId, facultyId);

    return res.json({ tickets });
  } catch (error) {
    return next(error);
  }
}

export async function callNextTicketHandler(req, res, next) {
  try {
    const { eventId, facultyId } = req.params;

    const ticket = await callNextTicket(eventId, facultyId);

    return res.json({ ticket });
  } catch (error) {
    return next(error);
  }
}

export async function completeTicketHandler(req, res, next) {
  try {
    const { ticketId } = req.params;

    const ticket = await completeTicket(ticketId);

    return res.json({ ticket });
  } catch (error) {
    return next(error);
  }
}

export async function skipTicketHandler(req, res, next) {
  try {
    const { ticketId } = req.params;

    const ticket = await skipTicket(ticketId);

    return res.json({ ticket });
  } catch (error) {
    return next(error);
  }
}
