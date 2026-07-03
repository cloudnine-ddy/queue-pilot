import { Router } from 'express';
import { requireAdminAuth } from '../../middleware/adminAuth.js';
import { getAdminProfileHandler } from './admin.controller.js';

export const adminRouter = Router();

adminRouter.use('/admin', requireAdminAuth);

adminRouter.get('/admin/me', getAdminProfileHandler);
