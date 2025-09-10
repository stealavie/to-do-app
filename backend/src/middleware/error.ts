import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  // Prisma errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Unique constraint violation',
          message: 'A record with this value already exists'
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Record not found'
        });
      default:
        return res.status(500).json({
          error: 'Database error'
        });
    }
  }

  // Default error
  return res.status(500).json({
    error: 'Internal server error'
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found'
  });
};
