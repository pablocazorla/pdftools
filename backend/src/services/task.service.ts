import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { fileService } from './file.service.js';
import type { TaskRecord, TaskResponse, TaskStatus, ToolType, TaskOutput } from '../types/index.js';

export class TaskService {
  private tasks = new Map<string, TaskRecord>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupJob();
  }

  public createTask(
    tool: ToolType,
    inputFiles: {
      originalName: string;
      storedPath: string;
      mimeType: string;
      size: number;
    }[] = [],
    metadata?: Record<string, unknown>
  ): TaskRecord {
    const taskId = uuidv4();
    const taskDir = fileService.getTaskDir(taskId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + env.TASK_RETENTION_HOURS * 3600 * 1000);

    const record: TaskRecord = {
      taskId,
      tool,
      status: 'queued',
      progress: 0,
      step: 'En cola',
      taskDir,
      inputFiles,
      outputs: [],
      error: null,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      metadata,
    };

    this.tasks.set(taskId, record);
    return record;
  }

  public getTask(taskId: string): TaskRecord | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    // Check expiration
    if (new Date() > task.expiresAt && task.status !== 'expired') {
      task.status = 'expired';
      task.updatedAt = new Date();
      fileService.removeTaskDir(taskId);
    }

    return task;
  }

  public updateProgress(taskId: string, progress: number, step: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'processing';
    task.progress = Math.min(100, Math.max(0, progress));
    task.step = step;
    task.updatedAt = new Date();
  }

  public completeTask(
    taskId: string,
    outputs: (TaskOutput & { internalPath: string })[],
    metadata?: Record<string, unknown>
  ): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.progress = 100;
    task.step = 'Completado';
    task.outputs = outputs;
    if (metadata) {
      task.metadata = { ...task.metadata, ...metadata };
    }
    task.updatedAt = new Date();
  }

  public failTask(
    taskId: string,
    code: string,
    message: string,
    details?: unknown
  ): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'failed';
    task.error = { code, message, details };
    task.step = 'Error';
    task.updatedAt = new Date();
  }

  public deleteTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    fileService.removeTaskDir(taskId);
    this.tasks.delete(taskId);
    return true;
  }

  public toResponse(task: TaskRecord): TaskResponse {
    return {
      taskId: task.taskId,
      tool: task.tool,
      status: task.status,
      progress: task.progress,
      step: task.step,
      outputs: task.outputs.map((out) => ({
        fileId: out.fileId,
        name: out.name,
        mimeType: out.mimeType,
        size: out.size,
        downloadUrl: out.downloadUrl,
        previewUrl: out.previewUrl,
        metadata: out.metadata,
      })),
      error: task.error,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      metadata: task.metadata,
    };
  }

  private startCleanupJob(): void {
    // Run cleanup every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.purgeExpiredTasks();
    }, 10 * 60 * 1000);
    // Don't keep process alive solely for this interval
    this.cleanupInterval.unref?.();
  }

  public clearAllTasks(): void {
    this.tasks.clear();
  }

  public purgeExpiredTasks(): void {
    const now = new Date();
    for (const [taskId, task] of this.tasks.entries()) {
      if (now > task.expiresAt) {
        fileService.removeTaskDir(taskId);
        task.status = 'expired';
        task.updatedAt = now;
      }
    }
  }
}

export const taskService = new TaskService();
