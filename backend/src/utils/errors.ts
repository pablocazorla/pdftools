export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'INTERNAL_ERROR', statusCode = 400, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class TaskExpiredError extends AppError {
  constructor(message = 'La tarea ha expirado y sus archivos han sido eliminados') {
    super(message, 'TASK_EXPIRED', 410);
  }
}

export class FileProcessingError extends AppError {
  constructor(message = 'Error al procesar el archivo', details?: unknown) {
    super(message, 'PROCESSING_ERROR', 500, details);
  }
}
