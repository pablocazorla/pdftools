import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { FileProcessingError } from '../utils/errors.js';
import type { PythonExecutionResult } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root of backend is two levels up from src/services -> backend
const BACKEND_ROOT = path.resolve(__dirname, '../..');
const PROCESSORS_DIR = path.resolve(BACKEND_ROOT, 'python/processors');

export class PythonService {
  private activeTasksCount = 0;
  private queue: Array<() => void> = [];

  constructor() {
    this.verifyPythonEnvironment();
  }

  public verifyPythonEnvironment(): void {
    if (!fs.existsSync(PROCESSORS_DIR)) {
      fs.mkdirSync(PROCESSORS_DIR, { recursive: true });
    }
  }

  private async acquireSlot(): Promise<void> {
    if (this.activeTasksCount < env.MAX_CONCURRENT_TASKS) {
      this.activeTasksCount++;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.activeTasksCount++;
        resolve();
      });
    });
  }

  private releaseSlot(): void {
    this.activeTasksCount--;
    const next = this.queue.shift();
    if (next) {
      next();
    }
  }

  public async runProcessor(
    scriptName: string,
    args: string[]
  ): Promise<PythonExecutionResult> {
    await this.acquireSlot();

    const scriptPath = path.join(PROCESSORS_DIR, scriptName);
    if (!fs.existsSync(scriptPath)) {
      this.releaseSlot();
      throw new FileProcessingError(`Procesador Python no encontrado: ${scriptName}`);
    }

    return new Promise<PythonExecutionResult>((resolve, reject) => {
      let isTimedOut = false;
      const child = spawn(env.PYTHON_EXECUTABLE, [scriptPath, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        isTimedOut = true;
        child.kill('SIGKILL');
      }, env.TASK_TIMEOUT_SECONDS * 1000);

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        this.releaseSlot();
        reject(
          new FileProcessingError(
            `No se pudo iniciar el proceso de Python (${env.PYTHON_EXECUTABLE}): ${err.message}`
          )
        );
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        this.releaseSlot();

        if (isTimedOut) {
          return reject(
            new FileProcessingError('El procesamiento superó el tiempo máximo permitido')
          );
        }

        let parsedData: unknown = null;
        // Search stdout for JSON result line (processors will output JSON as the final line)
        const lines = stdout.trim().split('\n');
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (line.startsWith('{') && line.endsWith('}')) {
            try {
              parsedData = JSON.parse(line);
              break;
            } catch {
              // Not valid json line, keep searching
            }
          }
        }

        if (code !== 0) {
          const errorMsg =
            (parsedData as { error?: string })?.error ||
            stderr.trim() ||
            'Error desconocido en el procesador Python';
          return reject(new FileProcessingError(errorMsg, { code, stderr }));
        }

        resolve({
          success: true,
          code: code ?? 0,
          stdout,
          stderr,
          data: parsedData,
        });
      });
    });
  }
}

export const pythonService = new PythonService();
