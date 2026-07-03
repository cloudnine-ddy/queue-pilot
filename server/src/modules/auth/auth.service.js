import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma.js';

export async function loginOperator(email, password) {
  const operator = await prisma.operator.findUnique({
    where: { email },
    include: {
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
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, operator.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      role: 'operator',
      facultyId: operator.facultyId,
    },
    process.env.JWT_SECRET,
    {
      subject: operator.id,
      expiresIn: '8h',
    }
  );

  return {
    token,
    operator: {
      id: operator.id,
      name: operator.name,
      email: operator.email,
      faculty: operator.faculty,
    },
  };
}

export async function loginAdmin(email, password) {
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      role: 'admin',
    },
    process.env.JWT_SECRET,
    {
      subject: admin.id,
      expiresIn: '8h',
    }
  );

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  };
}
