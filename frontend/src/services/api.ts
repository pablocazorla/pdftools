import type { TaskResponse } from '../types/index';

const API_BASE = '/api';

export class ApiError extends Error {
  public code: string;
  public details?: unknown;

  constructor(message: string, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const errorData = data?.error;
    const msg = errorData?.message || `Error del servidor (${res.status})`;
    const code = errorData?.code || 'SERVER_ERROR';
    throw new ApiError(msg, code, errorData?.details);
  }
  return data as T;
}

export const api = {
  // 1. PDF to Images
  async pdfToImages(file: File, dpi = 300): Promise<{ taskId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dpi', dpi.toString());

    const res = await fetch(`${API_BASE}/pdf-to-images`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<{ taskId: string }>(res);
  },

  // 2. Extract PDF Images (Inspect or Extract)
  async extractPdfImages(
    file: File,
    options: {
      format?: 'png' | 'jpg';
      inspect?: boolean;
      selectedIds?: string[];
    } = {}
  ): Promise<{ taskId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (options.inspect) {
      formData.append('inspect', 'true');
    }
    if (options.format) {
      formData.append('format', options.format);
    }
    if (options.selectedIds && options.selectedIds.length > 0) {
      formData.append('selectedIds', options.selectedIds.join(','));
    }

    const res = await fetch(`${API_BASE}/extract-pdf-images`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<{ taskId: string }>(res);
  },

  // 3. Images to PDF
  async imagesToPdf(
    files: File[],
    pageSize: string = 'A4',
    fileOrder?: string[]
  ): Promise<{ taskId: string }> {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }
    formData.append('pageSize', pageSize);
    if (fileOrder && fileOrder.length > 0) {
      formData.append('fileOrder', JSON.stringify(fileOrder));
    }

    const res = await fetch(`${API_BASE}/images-to-pdf`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<{ taskId: string }>(res);
  },

  // 4. Merge PDF
  async mergePdf(files: File[], fileOrder?: string[]): Promise<{ taskId: string }> {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }
    if (fileOrder && fileOrder.length > 0) {
      formData.append('fileOrder', JSON.stringify(fileOrder));
    }

    const res = await fetch(`${API_BASE}/merge-pdf`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<{ taskId: string }>(res);
  },

  // 5. Split PDF
  async splitPdf(file: File, ranges: string): Promise<{ taskId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ranges', ranges);

    const res = await fetch(`${API_BASE}/split-pdf`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<{ taskId: string }>(res);
  },

  // 6. Extract PDF Texts
  async extractPdfText(file: File): Promise<{ taskId: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/extract-pdf-text`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<{ taskId: string }>(res);
  },

  // 7. Convert PDF to Word
  async pdfToWord(file: File): Promise<{ taskId: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/pdf-to-word`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<{ taskId: string }>(res);
  },

  // Task querying and polling
  async getTask(taskId: string): Promise<TaskResponse> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`);
    return handleResponse<TaskResponse>(res);
  },

  async deleteTask(taskId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    await handleResponse<{ success: boolean }>(res);
  },

  async cleanStorage(): Promise<{ success: boolean; message: string; removedEntries: number }> {
    const res = await fetch(`${API_BASE}/storage/clean`, {
      method: 'POST',
    });
    return handleResponse<{ success: boolean; message: string; removedEntries: number }>(res);
  },

  /**
   * Polls task until completion or failure
   */
  async pollTask(
    taskId: string,
    onProgress?: (task: TaskResponse) => void,
    intervalMs = 600,
    maxAttempts = 300
  ): Promise<TaskResponse> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        attempts++;
        try {
          const task = await this.getTask(taskId);
          if (onProgress) {
            onProgress(task);
          }

          if (task.status === 'completed') {
            clearInterval(interval);
            resolve(task);
          } else if (task.status === 'failed') {
            clearInterval(interval);
            reject(
              new ApiError(
                task.error?.message || 'Error durante el procesamiento',
                task.error?.code || 'PROCESSING_ERROR',
                task.error?.details
              )
            );
          } else if (task.status === 'expired') {
            clearInterval(interval);
            reject(new ApiError('La tarea ha expirado', 'TASK_EXPIRED'));
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new ApiError('Tiempo de espera agotado al consultar la tarea', 'TIMEOUT'));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, intervalMs);
    });
  },
};
