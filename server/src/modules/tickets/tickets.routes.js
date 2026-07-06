import { Router } from 'express';
import {
  abandonTicketHandler,
  createTicketHandler,
  getTicketByTokenHandler,
} from './tickets.controller.js';

export const ticketsRouter = Router();

ticketsRouter.post('/public/events/:eventId/faculties/:facultyId/tickets', createTicketHandler);

ticketsRouter.get('/public/tickets/:token', getTicketByTokenHandler);

ticketsRouter.post('/public/tickets/:token/abandon', abandonTicketHandler);
