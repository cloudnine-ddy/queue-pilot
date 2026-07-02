import { Router } from 'express';
import {
  callNextTicketHandler,
  getWaitingTicketsHandler,
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
