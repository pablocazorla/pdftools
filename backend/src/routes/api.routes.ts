import { Router } from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { toolsController } from '../controllers/tools.controller.js';
import { taskController } from '../controllers/task.controller.js';
import { fileService } from '../services/file.service.js';
import { taskService } from '../services/task.service.js';

export const apiRouter = Router();

// 1. PDF to Images
apiRouter.post('/pdf-to-images', upload.single('file'), (req, res, next) => {
  toolsController.pdfToImages(req, res, next);
});

// 2. Extract PDF Images
apiRouter.post('/extract-pdf-images', upload.single('file'), (req, res, next) => {
  toolsController.extractPdfImages(req, res, next);
});

// 3. Images to PDF
apiRouter.post('/images-to-pdf', upload.array('files'), (req, res, next) => {
  toolsController.imagesToPdf(req, res, next);
});

// 4. Merge PDF
apiRouter.post('/merge-pdf', upload.array('files'), (req, res, next) => {
  toolsController.mergePdf(req, res, next);
});

// 5. Split PDF
apiRouter.post('/split-pdf', upload.single('file'), (req, res, next) => {
  toolsController.splitPdf(req, res, next);
});

// 6. Extract PDF Texts
apiRouter.post('/extract-pdf-text', upload.single('file'), (req, res, next) => {
  toolsController.extractPdfText(req, res, next);
});

// 7. Convert PDF to Word
apiRouter.post('/pdf-to-word', upload.single('file'), (req, res, next) => {
  toolsController.pdfToWord(req, res, next);
});

// Task Management Endpoints
apiRouter.get('/tasks/:taskId', (req, res, next) => {
  taskController.getTaskStatus(req, res, next);
});

apiRouter.get('/tasks/:taskId/files/:fileId', (req, res, next) => {
  taskController.downloadTaskFile(req, res, next);
});

apiRouter.delete('/tasks/:taskId', (req, res, next) => {
  taskController.deleteTask(req, res, next);
});

// Storage Cleanup Endpoint
apiRouter.post('/storage/clean', (_req, res) => {
  const result = fileService.cleanAllStorage();
  taskService.clearAllTasks();
  res.json({
    success: true,
    message: 'Almacenamiento temporal limpiado exitosamente',
    removedEntries: result.removedEntries,
  });
});
