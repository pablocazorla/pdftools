import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export interface ValidatedFile {
  originalName: string;
  storedPath: string;
  mimeType: string;
  size: number;
}

export class FileService {
  constructor() {
    this.ensureStorageDir();
  }

  public ensureStorageDir(): void {
    if (!fs.existsSync(env.resolvedStorageDir)) {
      fs.mkdirSync(env.resolvedStorageDir, { recursive: true });
    }
  }

  public getTaskDir(taskId: string): string {
    // Sanitize taskId to prevent traversal
    const safeTaskId = taskId.replace(/[^a-zA-Z0-9-]/g, '');
    return path.join(env.resolvedStorageDir, safeTaskId);
  }

  public createTaskDirs(taskId: string): { inputDir: string; outputDir: string; taskDir: string } {
    const taskDir = this.getTaskDir(taskId);
    const inputDir = path.join(taskDir, 'input');
    const outputDir = path.join(taskDir, 'output');

    fs.mkdirSync(inputDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });

    return { taskDir, inputDir, outputDir };
  }

  public removeTaskDir(taskId: string): void {
    const taskDir = this.getTaskDir(taskId);
    if (fs.existsSync(taskDir)) {
      try {
        fs.rmSync(taskDir, { recursive: true, force: true });
      } catch (err) {
        console.error(`Failed to remove task directory for task ${taskId}:`, err);
      }
    }
  }

  /**
   * Validate file buffer or header for magic numbers
   */
  public validatePdfMagicBytes(filePath: string): boolean {
    try {
      const fd = fs.openSync(filePath, 'r');
      const buffer = Buffer.alloc(8);
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);
      // PDF starts with %PDF-
      const header = buffer.toString('utf-8', 0, 5);
      return header.startsWith('%PDF-');
    } catch {
      return false;
    }
  }

  public validateImageMagicBytes(filePath: string): 'image/png' | 'image/jpeg' | null {
    try {
      const fd = fs.openSync(filePath, 'r');
      const buffer = Buffer.alloc(8);
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);

      // PNG: 89 50 4E 47 0D 0A 1A 0A
      if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      ) {
        return 'image/png';
      }

      // JPEG: FF D8 FF
      if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
      }

      return null;
    } catch {
      return null;
    }
  }

  public getSafeFileName(originalName: string): string {
    // Keep extension, sanitize base name
    const ext = path.extname(originalName).toLowerCase();
    const base = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 100);
    return `${base || 'document'}${ext}`;
  }
}

export const fileService = new FileService();
