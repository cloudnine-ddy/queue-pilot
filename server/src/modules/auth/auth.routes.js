import { Router } from 'express';
import { loginAdminHandler, loginOperatorHandler } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/auth/admin/login', loginAdminHandler);
authRouter.post('/auth/operator/login', loginOperatorHandler);
