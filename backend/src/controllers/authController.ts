import { Request, Response, NextFunction } from 'express';
import { login } from '../services/authService';

export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = await login(req.body);
    res.json(payload);
  } catch (error) {
    next(error);
  }
}
