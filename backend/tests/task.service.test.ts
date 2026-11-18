import { describe, it, expect } from 'vitest';
import { taskService } from '../src/services/task.service.js';

describe('TaskService', () => {
  it('creates and retrieves a new task in queued status', () => {
    const task = taskService.createTask('pdf-to-images');
    expect(task.taskId).toBeDefined();
    expect(task.tool).toBe('pdf-to-images');
    expect(task.status).toBe('queued');
    expect(task.progress).toBe(0);

    const fetched = taskService.getTask(task.taskId);
    expect(fetched).toBeDefined();
    expect(fetched?.taskId).toBe(task.taskId);
  });

  it('updates task progress and step', () => {
    const task = taskService.createTask('split-pdf');
    taskService.updateProgress(task.taskId, 45, 'Procesando páginas');

    const fetched = taskService.getTask(task.taskId);
    expect(fetched?.status).toBe('processing');
    expect(fetched?.progress).toBe(45);
    expect(fetched?.step).toBe('Procesando páginas');
  });

  it('completes a task with outputs', () => {
    const task = taskService.createTask('merge-pdf');
    taskService.completeTask(task.taskId, [
      {
        fileId: 'file-123',
        name: 'merged.pdf',
        mimeType: 'application/pdf',
        size: 5000,
        downloadUrl: `/api/tasks/${task.taskId}/files/file-123`,
        internalPath: '/fake/path/merged.pdf',
      },
    ]);

    const fetched = taskService.getTask(task.taskId);
    expect(fetched?.status).toBe('completed');
    expect(fetched?.progress).toBe(100);
    expect(fetched?.outputs).toHaveLength(1);
    expect(fetched?.outputs[0].fileId).toBe('file-123');
  });

  it('marks task as failed with error details', () => {
    const task = taskService.createTask('extract-pdf-text');
    taskService.failTask(task.taskId, 'INVALID_PDF', 'Documento protegido');

    const fetched = taskService.getTask(task.taskId);
    expect(fetched?.status).toBe('failed');
    expect(fetched?.error?.code).toBe('INVALID_PDF');
    expect(fetched?.error?.message).toBe('Documento protegido');
  });

  it('deletes a task', () => {
    const task = taskService.createTask('pdf-to-word');
    expect(taskService.getTask(task.taskId)).toBeDefined();

    const deleted = taskService.deleteTask(task.taskId);
    expect(deleted).toBe(true);
    expect(taskService.getTask(task.taskId)).toBeUndefined();
  });
});
