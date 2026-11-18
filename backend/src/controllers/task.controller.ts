import type { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { taskService } from '../services/task.service.js';
import { NotFoundError, TaskExpiredError, ValidationError } from '../utils/errors.js';

export class TaskController {
  public getTaskStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      const { taskId } = req.params;
      if (!taskId) {
        throw new ValidationError('Identificador de tarea requerido');
      }

      const task = taskService.getTask(taskId);
      if (!task) {
        throw new NotFoundError('Tarea no encontrada');
      }

      if (task.status === 'expired') {
        throw new TaskExpiredError();
      }

      res.json(taskService.toResponse(task));
    } catch (err) {
      next(err);
    }
  }

  public downloadTaskFile(req: Request, res: Response, next: NextFunction): void {
    try {
      const { taskId, fileId } = req.params;
      const inline = req.query.inline === 'true';

      if (!taskId || !fileId) {
        throw new ValidationError('Parámetros de descarga incompletos');
      }

      const task = taskService.getTask(taskId);
      if (!task) {
        throw new NotFoundError('Tarea no encontrada');
      }

      if (task.status === 'expired') {
        throw new TaskExpiredError();
      }

      const output = task.outputs.find((out) => out.fileId === fileId);
      if (!output) {
        throw new NotFoundError('Archivo no encontrado para esta tarea');
      }

      // Ensure file exists and is strictly within taskDir
      const resolvedPath = path.resolve(output.internalPath);
      const taskDirResolved = path.resolve(task.taskDir);
      if (!resolvedPath.startsWith(taskDirResolved)) {
        throw new ValidationError('Acceso denegado al archivo');
      }

      if (!fs.existsSync(resolvedPath)) {
        throw new NotFoundError('El archivo físico ya no está disponible en el servidor');
      }

      const dispositionType = inline ? 'inline' : 'attachment';
      const encodedFilename = encodeURIComponent(output.name);

      res.setHeader('Content-Type', output.mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `${dispositionType}; filename="${output.name}"; filename*=UTF-8''${encodedFilename}`
      );
      res.setHeader('Content-Length', output.size);

      const stream = fs.createReadStream(resolvedPath);
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }

  public deleteTask(req: Request, res: Response, next: NextFunction): void {
    try {
      const { taskId } = req.params;
      if (!taskId) {
        throw new ValidationError('Identificador de tarea requerido');
      }

      const success = taskService.deleteTask(taskId);
      if (!success) {
        throw new NotFoundError('Tarea no encontrada');
      }

      res.json({ success: true, message: 'Tarea y archivos eliminados exitosamente' });
    } catch (err) {
      next(err);
    }
  }
}

export const taskController = new TaskController();
