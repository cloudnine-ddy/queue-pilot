import { Router } from 'express';
import { requireAdminAuth } from '../../middleware/adminAuth.js';
import {
  createEventHandler,
  createFacultyHandler,
  createOperatorHandler,
  endEventHandler,
  getAdminEventsHandler,
  getAdminEventDetailHandler,
  getAdminFacultiesHandler,
  getAdminOperatorsHandler,
  getAdminOverviewHandler,
  getAdminProfileHandler,
  resetOperatorPasswordHandler,
  startEventHandler,
  updateFacultyHandler,
  updateOperatorHandler,
} from './admin.controller.js';

export const adminRouter = Router();

adminRouter.use('/admin', requireAdminAuth);

adminRouter.get('/admin/me', getAdminProfileHandler);
adminRouter.get('/admin/overview', getAdminOverviewHandler);
adminRouter.get('/admin/events', getAdminEventsHandler);
adminRouter.get('/admin/events/:eventId/detail', getAdminEventDetailHandler);
adminRouter.get('/admin/faculties', getAdminFacultiesHandler);
adminRouter.post('/admin/faculties', createFacultyHandler);
adminRouter.patch('/admin/faculties/:facultyId', updateFacultyHandler);
adminRouter.get('/admin/operators', getAdminOperatorsHandler);
adminRouter.post('/admin/operators', createOperatorHandler);
adminRouter.patch('/admin/operators/:operatorId', updateOperatorHandler);
adminRouter.post('/admin/operators/:operatorId/reset-password', resetOperatorPasswordHandler);
adminRouter.post('/admin/events', createEventHandler);
adminRouter.post('/admin/events/:eventId/start', startEventHandler);
adminRouter.post('/admin/events/:eventId/end', endEventHandler);
