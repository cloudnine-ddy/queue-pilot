import { Router } from 'express';
import { loginOperatorHandler } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/auth/operator/login', loginOperatorHandler);
