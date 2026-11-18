import type { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { taskService } from '../services/task.service.js';
import { fileService } from '../services/file.service.js';
import { pythonService } from '../services/python.service.js';
import {
  validateSinglePdf,
  validateMultiplePdfs,
  validateImages,
} from '../validators/file.validator.js';
import { parseAndValidateRanges } from '../validators/range.validator.js';
import { ValidationError } from '../utils/errors.js';
import type { TaskOutput } from '../types/index.js';

export class ToolsController {
  // 1. PDF to Images
  public async pdfToImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = validateSinglePdf(req.file);
      const dpi = req.body.dpi ? parseInt(req.body.dpi, 10) : 300;

      const baseName = path.parse(file.originalname).name;
      const task = taskService.createTask('pdf-to-images', [
        {
          originalName: file.originalname,
          storedPath: file.path,
          mimeType: file.mimetype,
          size: file.size,
        },
      ]);

      const { inputDir, outputDir } = fileService.createTaskDirs(task.taskId);
      const targetInputPath = path.join(inputDir, file.filename);
      fs.renameSync(file.path, targetInputPath);

      res.status(202).json({
        taskId: task.taskId,
        tool: task.tool,
        status: task.status,
      });

      // Background processing
      (async () => {
        try {
          taskService.updateProgress(task.taskId, 20, 'Renderizando páginas en 300 DPI');
          const result = await pythonService.runProcessor('pdf_to_images.py', [
            '--input',
            targetInputPath,
            '--output-dir',
            outputDir,
            '--base-name',
            baseName,
            '--dpi',
            dpi.toString(),
          ]);

          const data = result.data as {
            files: Array<{
              name: string;
              path: string;
              page: number;
              width: number;
              height: number;
              size: number;
            }>;
            zip: { name: string; path: string; size: number };
            pagesCount: number;
          };

          const outputs: (TaskOutput & { internalPath: string })[] = [];

          if (data.zip) {
            const zipId = uuidv4();
            outputs.push({
              fileId: zipId,
              name: data.zip.name,
              mimeType: 'application/zip',
              size: data.zip.size,
              downloadUrl: `/api/tasks/${task.taskId}/files/${zipId}`,
              internalPath: data.zip.path,
              metadata: { isZip: true, totalPages: data.pagesCount },
            });
          }

          for (const f of data.files) {
            const fileId = uuidv4();
            outputs.push({
              fileId,
              name: f.name,
              mimeType: 'image/png',
              size: f.size,
              downloadUrl: `/api/tasks/${task.taskId}/files/${fileId}`,
              previewUrl: `/api/tasks/${task.taskId}/files/${fileId}?inline=true`,
              internalPath: f.path,
              metadata: { page: f.page, width: f.width, height: f.height },
            });
          }

          taskService.completeTask(task.taskId, outputs, {
            pagesCount: data.pagesCount,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error desconocido';
          taskService.failTask(task.taskId, 'PROCESSING_ERROR', msg);
        }
      })();
    } catch (err) {
      next(err);
    }
  }

  // 2. Extract PDF Images (Inspect & Extract)
  public async extractPdfImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = validateSinglePdf(req.file);
      const isInspect = req.body.inspect === 'true';
      const targetFormat = req.body.format === 'jpg' ? 'jpg' : 'png';
      const selectedIds = req.body.selectedIds || '';

      const baseName = path.parse(file.originalname).name;
      const task = taskService.createTask('extract-pdf-images', [
        {
          originalName: file.originalname,
          storedPath: file.path,
          mimeType: file.mimetype,
          size: file.size,
        },
      ]);

      const { inputDir, outputDir } = fileService.createTaskDirs(task.taskId);
      const targetInputPath = path.join(inputDir, file.filename);
      fs.renameSync(file.path, targetInputPath);

      res.status(202).json({
        taskId: task.taskId,
        tool: task.tool,
        status: task.status,
      });

      // Background processing
      (async () => {
        try {
          taskService.updateProgress(task.taskId, 25, 'Extrayendo imágenes incrustadas');

          const args = [
            '--input',
            targetInputPath,
            '--output-dir',
            outputDir,
            '--base-name',
            baseName,
            '--format',
            targetFormat,
          ];

          if (isInspect) {
            args.push('--inspect-only');
          } else if (selectedIds) {
            args.push('--selected-ids', selectedIds);
          }

          const result = await pythonService.runProcessor('extract_pdf_images.py', args);
          const data = result.data as {
            mode?: string;
            images?: Array<{
              id: string;
              xref: number;
              page: number;
              width: number;
              height: number;
              format: string;
              size: number;
              thumbName: string;
              thumbPath: string;
            }>;
            files?: Array<{
              id: string;
              name: string;
              path: string;
              page: number;
              width: number;
              height: number;
              size: number;
              format: string;
            }>;
            zip?: { name: string; path: string; size: number };
            totalDetected?: number;
            extractedCount?: number;
          };

          const outputs: (TaskOutput & { internalPath: string })[] = [];

          if (data.mode === 'inspect') {
            const detectedList = [];
            for (const img of data.images || []) {
              const fileId = uuidv4();
              outputs.push({
                fileId,
                name: img.thumbName,
                mimeType: 'image/png',
                size: img.size,
                downloadUrl: `/api/tasks/${task.taskId}/files/${fileId}`,
                previewUrl: `/api/tasks/${task.taskId}/files/${fileId}?inline=true`,
                internalPath: img.thumbPath,
                metadata: {
                  imageId: img.id,
                  page: img.page,
                  width: img.width,
                  height: img.height,
                  format: img.format,
                },
              });
              detectedList.push({
                id: img.id,
                page: img.page,
                width: img.width,
                height: img.height,
                format: img.format,
                size: img.size,
                previewUrl: `/api/tasks/${task.taskId}/files/${fileId}?inline=true`,
              });
            }

            taskService.completeTask(task.taskId, outputs, {
              isInspect: true,
              detectedImages: detectedList,
            });
            return;
          }

          if (data.zip && data.zip.size > 0) {
            const zipId = uuidv4();
            outputs.push({
              fileId: zipId,
              name: data.zip.name,
              mimeType: 'application/zip',
              size: data.zip.size,
              downloadUrl: `/api/tasks/${task.taskId}/files/${zipId}`,
              internalPath: data.zip.path,
              metadata: { isZip: true },
            });
          }

          for (const f of data.files || []) {
            const fileId = uuidv4();
            outputs.push({
              fileId,
              name: f.name,
              mimeType: targetFormat === 'jpg' ? 'image/jpeg' : 'image/png',
              size: f.size,
              downloadUrl: `/api/tasks/${task.taskId}/files/${fileId}`,
              previewUrl: `/api/tasks/${task.taskId}/files/${fileId}?inline=true`,
              internalPath: f.path,
              metadata: { page: f.page, width: f.width, height: f.height, format: f.format },
            });
          }

          taskService.completeTask(task.taskId, outputs, {
            extractedCount: data.extractedCount ?? 0,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error desconocido';
          taskService.failTask(task.taskId, 'PROCESSING_ERROR', msg);
        }
      })();
    } catch (err) {
      next(err);
    }
  }

  // 3. Images to PDF
  public async imagesToPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = validateImages(req.files as Express.Multer.File[]);
      const pageSize = ['A3', 'A4', 'A5', 'original'].includes(req.body.pageSize)
        ? req.body.pageSize
        : 'A4';

      let order: string[] = [];
      if (req.body.fileOrder) {
        try {
          order = JSON.parse(req.body.fileOrder);
        } catch {
          // ignore invalid order, fallback to upload order
        }
      }

      // Reorder files if fileOrder provided
      let orderedFiles = files;
      if (order.length > 0) {
        const fileMap = new Map(files.map((f) => [f.originalname, f]));
        const sorted: Express.Multer.File[] = [];
        for (const name of order) {
          const f = fileMap.get(name);
          if (f) {
            sorted.push(f);
            fileMap.delete(name);
          }
        }
        orderedFiles = [...sorted, ...Array.from(fileMap.values())];
      }

      const task = taskService.createTask(
        'images-to-pdf',
        orderedFiles.map((f) => ({
          originalName: f.originalname,
          storedPath: f.path,
          mimeType: f.mimetype,
          size: f.size,
        }))
      );

      const { inputDir, outputDir } = fileService.createTaskDirs(task.taskId);
      const targetPaths: string[] = [];

      for (const file of orderedFiles) {
        const dest = path.join(inputDir, file.filename);
        fs.renameSync(file.path, dest);
        targetPaths.push(dest);
      }

      res.status(202).json({
        taskId: task.taskId,
        tool: task.tool,
        status: task.status,
      });

      // Background processing
      (async () => {
        try {
          taskService.updateProgress(task.taskId, 30, 'Generando documento PDF');
          const result = await pythonService.runProcessor('images_to_pdf.py', [
            '--files-json',
            JSON.stringify(targetPaths),
            '--output-dir',
            outputDir,
            '--output-name',
            'imagenes_combinadas.pdf',
            '--page-size',
            pageSize,
          ]);

          const data = result.data as {
            output: { name: string; path: string; size: number };
            pagesCount: number;
          };

          const fileId = uuidv4();
          const outputs: (TaskOutput & { internalPath: string })[] = [
            {
              fileId,
              name: data.output.name,
              mimeType: 'application/pdf',
              size: data.output.size,
              downloadUrl: `/api/tasks/${task.taskId}/files/${fileId}`,
              previewUrl: `/api/tasks/${task.taskId}/files/${fileId}?inline=true`,
              internalPath: data.output.path,
              metadata: { pagesCount: data.pagesCount, pageSize },
            },
          ];

          taskService.completeTask(task.taskId, outputs, { pagesCount: data.pagesCount });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error desconocido';
          taskService.failTask(task.taskId, 'PROCESSING_ERROR', msg);
        }
      })();
    } catch (err) {
      next(err);
    }
  }

  // 4. Merge PDF
  public async mergePdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = validateMultiplePdfs(req.files as Express.Multer.File[]);

      let order: string[] = [];
      if (req.body.fileOrder) {
        try {
          order = JSON.parse(req.body.fileOrder);
        } catch {
          // ignore
        }
      }

      let orderedFiles = files;
      if (order.length > 0) {
        const fileMap = new Map(files.map((f) => [f.originalname, f]));
        const sorted: Express.Multer.File[] = [];
        for (const name of order) {
          const f = fileMap.get(name);
          if (f) {
            sorted.push(f);
            fileMap.delete(name);
          }
        }
        orderedFiles = [...sorted, ...Array.from(fileMap.values())];
      }

      const task = taskService.createTask(
        'merge-pdf',
        orderedFiles.map((f) => ({
          originalName: f.originalname,
          storedPath: f.path,
          mimeType: f.mimetype,
          size: f.size,
        }))
      );

      const { inputDir, outputDir } = fileService.createTaskDirs(task.taskId);
      const targetPaths: string[] = [];

      for (const file of orderedFiles) {
        const dest = path.join(inputDir, file.filename);
        fs.renameSync(file.path, dest);
        targetPaths.push(dest);
      }

      res.status(202).json({
        taskId: task.taskId,
        tool: task.tool,
        status: task.status,
      });

      // Background processing
      (async () => {
        try {
          taskService.updateProgress(task.taskId, 35, 'Combinando documentos PDF sin rasterizar');
          const result = await pythonService.runProcessor('merge_pdf.py', [
            '--files-json',
            JSON.stringify(targetPaths),
            '--output-dir',
            outputDir,
            '--output-name',
            'documentos_unidos.pdf',
          ]);

          const data = result.data as {
            output: { name: string; path: string; size: number };
            totalPages: number;
            filesMerged: number;
          };

          const fileId = uuidv4();
          const outputs: (TaskOutput & { internalPath: string })[] = [
            {
              fileId,
              name: data.output.name,
              mimeType: 'application/pdf',
              size: data.output.size,
              downloadUrl: `/api/tasks/${task.taskId}/files/${fileId}`,
              previewUrl: `/api/tasks/${task.taskId}/files/${fileId}?inline=true`,
              internalPath: data.output.path,
              metadata: { totalPages: data.totalPages, filesMerged: data.filesMerged },
            },
          ];

          taskService.completeTask(task.taskId, outputs, {
            totalPages: data.totalPages,
            filesMerged: data.filesMerged,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error desconocido';
          taskService.failTask(task.taskId, 'PROCESSING_ERROR', msg);
        }
      })();
    } catch (err) {
      next(err);
    }
  }

  // 5. Split PDF
  public async splitPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = validateSinglePdf(req.file);
      const rangesInput = req.body.ranges;
      if (!rangesInput) {
        throw new ValidationError('Debes especificar los rangos de páginas para dividir');
      }

      const parsedRanges = parseAndValidateRanges(rangesInput);
      const baseName = path.parse(file.originalname).name;

      const task = taskService.createTask('split-pdf', [
        {
          originalName: file.originalname,
          storedPath: file.path,
          mimeType: file.mimetype,
          size: file.size,
        },
      ]);

      const { inputDir, outputDir } = fileService.createTaskDirs(task.taskId);
      const targetInputPath = path.join(inputDir, file.filename);
      fs.renameSync(file.path, targetInputPath);

      res.status(202).json({
        taskId: task.taskId,
        tool: task.tool,
        status: task.status,
      });

      // Background processing
      (async () => {
        try {
          taskService.updateProgress(task.taskId, 30, 'Extrayendo secciones de páginas');
          const result = await pythonService.runProcessor('split_pdf.py', [
            '--input',
            targetInputPath,
            '--ranges-json',
            JSON.stringify(parsedRanges),
            '--output-dir',
            outputDir,
            '--base-name',
            baseName,
          ]);

          const data = result.data as {
            files: Array<{
              name: string;
              path: string;
              start: number;
              end: number;
              pageCount: number;
              size: number;
            }>;
            zip: { name: string; path: string; size: number };
            totalDocumentPages: number;
            splitCount: number;
          };

          const outputs: (TaskOutput & { internalPath: string })[] = [];

          if (data.zip) {
            const zipId = uuidv4();
            outputs.push({
              fileId: zipId,
              name: data.zip.name,
              mimeType: 'application/zip',
              size: data.zip.size,
              downloadUrl: `/api/tasks/${task.taskId}/files/${zipId}`,
              internalPath: data.zip.path,
              metadata: { isZip: true, splitCount: data.splitCount },
            });
          }

          for (const f of data.files) {
            const fileId = uuidv4();
            outputs.push({
              fileId,
              name: f.name,
              mimeType: 'application/pdf',
              size: f.size,
              downloadUrl: `/api/tasks/${task.taskId}/files/${fileId}`,
              previewUrl: `/api/tasks/${task.taskId}/files/${fileId}?inline=true`,
              internalPath: f.path,
              metadata: { start: f.start, end: f.end, pageCount: f.pageCount },
            });
          }

          taskService.completeTask(task.taskId, outputs, {
            totalDocumentPages: data.totalDocumentPages,
            splitCount: data.splitCount,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error desconocido';
          taskService.failTask(task.taskId, 'PROCESSING_ERROR', msg);
        }
      })();
    } catch (err) {
      next(err);
    }
  }

  // 6. Extract PDF Texts
  public async extractPdfText(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = validateSinglePdf(req.file);
      const baseName = path.parse(file.originalname).name;

      const task = taskService.createTask('extract-pdf-text', [
        {
          originalName: file.originalname,
          storedPath: file.path,
          mimeType: file.mimetype,
          size: file.size,
        },
      ]);

      const { inputDir, outputDir } = fileService.createTaskDirs(task.taskId);
      const targetInputPath = path.join(inputDir, file.filename);
      fs.renameSync(file.path, targetInputPath);

      res.status(202).json({
        taskId: task.taskId,
        tool: task.tool,
        status: task.status,
      });

      // Background processing
      (async () => {
        try {
          taskService.updateProgress(task.taskId, 40, 'Extrayendo texto digital estructurado');
          const result = await pythonService.runProcessor('extract_pdf_text.py', [
            '--input',
            targetInputPath,
            '--output-dir',
            outputDir,
            '--base-name',
            baseName,
          ]);

          const data = result.data as {
            output: { name: string; path: string; size: number };
            totalPages: number;
            pagesWithText: number;
            hasSelectableText: boolean;
            totalCharacters: number;
            extractedText: string;
          };

          const fileId = uuidv4();
          const outputs: (TaskOutput & { internalPath: string })[] = [
            {
              fileId,
              name: data.output.name,
              mimeType: 'text/plain',
              size: data.output.size,
              downloadUrl: `/api/tasks/${task.taskId}/files/${fileId}`,
              internalPath: data.output.path,
              metadata: {
                totalPages: data.totalPages,
                pagesWithText: data.pagesWithText,
                hasSelectableText: data.hasSelectableText,
                totalCharacters: data.totalCharacters,
              },
            },
          ];

          taskService.completeTask(task.taskId, outputs, {
            totalPages: data.totalPages,
            pagesWithText: data.pagesWithText,
            hasSelectableText: data.hasSelectableText,
            totalCharacters: data.totalCharacters,
            extractedText: data.extractedText,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error desconocido';
          taskService.failTask(task.taskId, 'PROCESSING_ERROR', msg);
        }
      })();
    } catch (err) {
      next(err);
    }
  }

  // 7. Convert PDF to Word
  public async pdfToWord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = validateSinglePdf(req.file);
      const baseName = path.parse(file.originalname).name;

      const task = taskService.createTask('pdf-to-word', [
        {
          originalName: file.originalname,
          storedPath: file.path,
          mimeType: file.mimetype,
          size: file.size,
        },
      ]);

      const { inputDir, outputDir } = fileService.createTaskDirs(task.taskId);
      const targetInputPath = path.join(inputDir, file.filename);
      fs.renameSync(file.path, targetInputPath);

      res.status(202).json({
        taskId: task.taskId,
        tool: task.tool,
        status: task.status,
      });

      // Background processing
      (async () => {
        try {
          taskService.updateProgress(task.taskId, 25, 'Renderizando páginas e insertando en documento DOCX');
          const result = await pythonService.runProcessor('pdf_to_word.py', [
            '--input',
            targetInputPath,
            '--output-dir',
            outputDir,
            '--output-name',
            `${baseName}.docx`,
            '--dpi',
            '200',
          ]);

          const data = result.data as {
            output: { name: string; path: string; size: number };
            totalPages: number;
            isVisualFidelityOnly: boolean;
          };

          const fileId = uuidv4();
          const outputs: (TaskOutput & { internalPath: string })[] = [
            {
              fileId,
              name: data.output.name,
              mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              size: data.output.size,
              downloadUrl: `/api/tasks/${task.taskId}/files/${fileId}`,
              internalPath: data.output.path,
              metadata: {
                totalPages: data.totalPages,
                isVisualFidelityOnly: true,
              },
            },
          ];

          taskService.completeTask(task.taskId, outputs, {
            totalPages: data.totalPages,
            isVisualFidelityOnly: true,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error desconocido';
          taskService.failTask(task.taskId, 'PROCESSING_ERROR', msg);
        }
      })();
    } catch (err) {
      next(err);
    }
  }
}

export const toolsController = new ToolsController();
