import { Router } from 'express';
import { callNextTicketHandler } from './operators.controller.js';

export const operatorsRouter = Router();

operatorsRouter.post(
  '/operator/events/:eventId/faculties/:facultyId/call-next',
  callNextTicketHandler
);
