import { Router } from 'express';
import { getEventFacultiesHandler } from "./faculties.controller.js";

export const facultiesRouter = Router();

facultiesRouter.get('/public/events/:eventId/faculties', getEventFacultiesHandler);