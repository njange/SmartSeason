import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Not Found' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation error',
      errors: err.flatten()
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Image size exceeds 5MB limit.'
      : err.message;
    res.status(400).json({ message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
