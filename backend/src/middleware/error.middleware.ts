import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import multer from 'multer';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null,
      },
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    let message = 'Error en la subida de archivos';
    let code = 'UPLOAD_ERROR';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'El archivo supera el tamaño máximo permitido';
      code = 'FILE_TOO_LARGE';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Se superó la cantidad máxima de archivos permitidos';
      code = 'TOO_MANY_FILES';
    }

    res.status(400).json({
      error: {
        code,
        message,
        details: null,
      },
    });
    return;
  }

  // Generic internal server error - never leak traces or paths
  console.error('[Internal Error]:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocurrió un error interno en el servidor.',
      details: null,
    },
  });
}
