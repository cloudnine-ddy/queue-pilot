import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';

export async function requireOperatorAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== 'operator') {
      const error = new Error('Operator access required.');
      error.statusCode = 403;
      throw error;
    }

    const operator = await prisma.operator.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        facultyId: true,
        faculty: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!operator) {
      const error = new Error('Operator not found.');
      error.statusCode = 401;
      throw error;
    }

    req.operator = operator;
    return next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = 'Invalid or expired token.';
    }

    return next(error);
  }
}
