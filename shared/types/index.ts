export type ToolType =
  | 'pdf-to-images'
  | 'extract-pdf-images'
  | 'images-to-pdf'
  | 'merge-pdf'
  | 'split-pdf'
  | 'extract-pdf-text'
  | 'pdf-to-word';

export type TaskStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'expired';

export interface TaskOutput {
  fileId: string;
  name: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
  previewUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface TaskError {
  code: string;
  message: string;
  details?: unknown;
}

export interface TaskResponse {
  taskId: string;
  tool: ToolType;
  status: TaskStatus;
  progress?: number;
  step?: string;
  outputs: TaskOutput[];
  error: TaskError | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TaskCreationResponse {
  taskId: string;
  tool: ToolType;
  status: TaskStatus;
}

// Extracted image preview metadata for extract-pdf-images
export interface DetectedImage {
  id: string;
  page: number;
  width: number;
  height: number;
  format: string;
  size: number;
  previewUrl?: string;
}

// Tool options
export interface PdfToImagesOptions {
  dpi?: number;
}

export interface ExtractPdfImagesOptions {
  format: 'png' | 'jpg';
  selectedImageIds?: string[];
}

export type PageSizeOption = 'A3' | 'A4' | 'A5' | 'original';

export interface ImagesToPdfOptions {
  pageSize: PageSizeOption;
}

export interface MergePdfOptions {
  fileOrder?: string[];
}

export interface SplitPdfOptions {
  ranges: string;
}

export interface AppErrorResponse {
  error: TaskError;
}
