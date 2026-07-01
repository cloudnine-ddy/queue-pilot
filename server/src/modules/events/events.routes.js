import { Router } from 'express';
import { getActiveEventHandler } from './events.controller.js';

export const eventsRouter = Router();

eventsRouter.get('/public/events/active', getActiveEventHandler);
