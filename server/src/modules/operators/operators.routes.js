import { Router } from 'express';
import {
  callNextTicketHandler,
  completeTicketHandler,
  getWaitingTicketsHandler,
  skipTicketHandler,
} from './operators.controller.js';

export const operatorsRouter = Router();

operatorsRouter.get(
  '/operator/events/:eventId/faculties/:facultyId/tickets/waiting',
  getWaitingTicketsHandler
);

operatorsRouter.post(
  '/operator/events/:eventId/faculties/:facultyId/call-next',
  callNextTicketHandler
);

operatorsRouter.post('/operator/tickets/:ticketId/done', completeTicketHandler);

operatorsRouter.post('/operator/tickets/:ticketId/skip', skipTicketHandler);
