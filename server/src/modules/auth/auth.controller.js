import { loginAdmin, loginOperator } from './auth.service.js';

export async function loginOperatorHandler(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await loginOperator(email, password);

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function loginAdminHandler(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await loginAdmin(email, password);

    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
