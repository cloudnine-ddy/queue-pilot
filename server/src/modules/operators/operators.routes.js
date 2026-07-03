import { Router } from 'express';
import { requireOperatorAuth } from '../../middleware/operatorAuth.js';
import {
  callNextTicketHandler,
  completeTicketHandler,
  getWaitingTicketsHandler,
  skipTicketHandler,
} from './operators.controller.js';

export const operatorsRouter = Router();

operatorsRouter.use('/operator', requireOperatorAuth);

operatorsRouter.get(
  '/operator/events/:eventId/tickets/waiting',
  getWaitingTicketsHandler
);

operatorsRouter.post(
  '/operator/events/:eventId/call-next',
  callNextTicketHandler
);

operatorsRouter.post('/operator/tickets/:ticketId/done', completeTicketHandler);

operatorsRouter.post('/operator/tickets/:ticketId/skip', skipTicketHandler);
