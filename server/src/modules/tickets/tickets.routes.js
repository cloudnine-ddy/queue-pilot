import { Router } from 'express';
import { createTicketHandler } from './tickets.controller.js';

export const ticketsRouter = Router();

ticketsRouter.post(
  '/public/events/:eventId/faculties/:facultyId/tickets',
  createTicketHandler
);