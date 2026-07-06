import {
  callNextTicket,
  completeTicket,
  getCalledTickets,
  getWaitingTickets,
  skipTicket,
} from './operators.service.js';

export async function getCalledTicketsHandler(req, res, next) {
  try {
    const { eventId } = req.params;
    const { facultyId } = req.operator;

    const tickets = await getCalledTickets(eventId, facultyId);

    return res.json({ tickets });
  } catch (error) {
    return next(error);
  }
}

export async function getWaitingTicketsHandler(req, res, next) {
  try {
    const { eventId } = req.params;
    const { facultyId } = req.operator;

    const tickets = await getWaitingTickets(eventId, facultyId);

    return res.json({ tickets });
  } catch (error) {
    return next(error);
  }
}

export async function callNextTicketHandler(req, res, next) {
  try {
    const { eventId } = req.params;
    const { facultyId } = req.operator;

    const ticket = await callNextTicket(eventId, facultyId);

    return res.json({ ticket });
  } catch (error) {
    return next(error);
  }
}

export async function completeTicketHandler(req, res, next) {
  try {
    const { ticketId } = req.params;
    const { facultyId } = req.operator;

    const ticket = await completeTicket(ticketId, facultyId);

    return res.json({ ticket });
  } catch (error) {
    return next(error);
  }
}

export async function skipTicketHandler(req, res, next) {
  try {
    const { ticketId } = req.params;
    const { facultyId } = req.operator;

    const ticket = await skipTicket(ticketId, facultyId);

    return res.json({ ticket });
  } catch (error) {
    return next(error);
  }
}
