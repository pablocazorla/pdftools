import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';

const uploadStagingDir = path.join(env.resolvedStorageDir, '_staging');
if (!fs.existsSync(uploadStagingDir)) {
  fs.mkdirSync(uploadStagingDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadStagingDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
    files: env.UPLOAD_MAX_FILES,
  },
});
