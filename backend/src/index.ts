import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { apiRouter } from './routes/api.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { fileService } from './services/file.service.js';

export const app = express();

// Ensure storage directory is initialized
fileService.ensureStorageDir();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or matching FRONTEND_ORIGIN
      if (!origin || origin === env.FRONTEND_ORIGIN || env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('No permitido por la política CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Main API Router
app.use('/api', apiRouter);

// Centralized error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`🚀 PDF Tools Backend running on http://localhost:${env.PORT}`);
    console.log(`📁 Storage directory: ${env.resolvedStorageDir}`);
    console.log(`🐍 Python binary: ${env.PYTHON_EXECUTABLE}`);
  });
}
