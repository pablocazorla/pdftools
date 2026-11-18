import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { app } from '../src/index.js';
import type { TaskResponse } from '../src/types/index.js';

let tempDir: string;
let samplePdfBuffer: Buffer;
let sampleImgBuffer: Buffer;

beforeAll(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdftools-test-'));
  const tempPdf = path.join(tempDir, 'sample.pdf');
  const tempImg = path.join(tempDir, 'img.png');

  // Minimal valid 1x1 PNG:
  sampleImgBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  fs.writeFileSync(tempImg, sampleImgBuffer);

  // Generate valid 2-page PDF by writing a temporary script
  const scriptPath = path.join(tempDir, 'gen.py');
  fs.writeFileSync(
    scriptPath,
    `import fitz
doc = fitz.open()
p1 = doc.new_page(width=595, height=842)
p1.insert_text((50, 100), "Pagina 1 de prueba")
p1.insert_image(fitz.Rect(50, 150, 200, 300), filename=r"${tempImg}")
p2 = doc.new_page(width=595, height=842)
p2.insert_text((50, 100), "Pagina 2 de prueba")
doc.save(r"${tempPdf}")
doc.close()
`
  );
  execSync(`python "${scriptPath}"`);
  samplePdfBuffer = fs.readFileSync(tempPdf);
});

afterAll(() => {
  if (tempDir && fs.existsSync(tempDir)) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
});

async function waitForTaskCompletion(taskId: string, maxWaitMs = 15000): Promise<TaskResponse> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await request(app).get(`/api/tasks/${taskId}`);
    expect(res.status).toBe(200);
    const task: TaskResponse = res.body;
    if (task.status === 'completed') {
      return task;
    }
    if (task.status === 'failed') {
      throw new Error(`Task failed: ${task.error?.message}`);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Task timeout: ${taskId}`);
}

describe('Full End-to-End Tools Integration', () => {
  it('Tool 1: PDF to Images', async () => {
    const res = await request(app)
      .post('/api/pdf-to-images')
      .attach('file', samplePdfBuffer, 'sample.pdf')
      .field('dpi', '150');

    expect(res.status).toBe(202);
    expect(res.body.taskId).toBeDefined();

    const task = await waitForTaskCompletion(res.body.taskId);
    expect(task.status).toBe('completed');
    expect(task.outputs.length).toBeGreaterThanOrEqual(2);

    const zipOutput = task.outputs.find((o) => o.mimeType === 'application/zip');
    expect(zipOutput).toBeDefined();
    if (zipOutput) {
      const dlRes = await request(app).get(zipOutput.downloadUrl);
      expect(dlRes.status).toBe(200);
      expect(dlRes.headers['content-type']).toContain('application/zip');
    }
  });

  it('Tool 2: Extract PDF Images', async () => {
    const res = await request(app)
      .post('/api/extract-pdf-images')
      .attach('file', samplePdfBuffer, 'sample.pdf')
      .field('format', 'png');

    expect(res.status).toBe(202);
    const task = await waitForTaskCompletion(res.body.taskId);
    expect(task.status).toBe('completed');
    expect(task.outputs.length).toBeGreaterThanOrEqual(1);
  });

  it('Tool 3: Images to PDF', async () => {
    const res = await request(app)
      .post('/api/images-to-pdf')
      .attach('files', sampleImgBuffer, 'img1.png')
      .attach('files', sampleImgBuffer, 'img2.png')
      .field('pageSize', 'A4');

    expect(res.status).toBe(202);
    const task = await waitForTaskCompletion(res.body.taskId);
    expect(task.status).toBe('completed');
    expect(task.outputs).toHaveLength(1);
    expect(task.outputs[0].mimeType).toBe('application/pdf');
  });

  it('Tool 4: Merge PDF', async () => {
    const res = await request(app)
      .post('/api/merge-pdf')
      .attach('files', samplePdfBuffer, 'doc1.pdf')
      .attach('files', samplePdfBuffer, 'doc2.pdf');

    expect(res.status).toBe(202);
    const task = await waitForTaskCompletion(res.body.taskId);
    expect(task.status).toBe('completed');
    expect(task.metadata?.totalPages).toBe(4);
  });

  it('Tool 5: Split PDF', async () => {
    const res = await request(app)
      .post('/api/split-pdf')
      .attach('file', samplePdfBuffer, 'sample.pdf')
      .field('ranges', '1, 2');

    expect(res.status).toBe(202);
    const task = await waitForTaskCompletion(res.body.taskId);
    expect(task.status).toBe('completed');
    expect(task.metadata?.splitCount).toBe(2);
  });

  it('Tool 6: Extract PDF Texts', async () => {
    const res = await request(app)
      .post('/api/extract-pdf-text')
      .attach('file', samplePdfBuffer, 'sample.pdf');

    expect(res.status).toBe(202);
    const task = await waitForTaskCompletion(res.body.taskId);
    expect(task.status).toBe('completed');
    expect(task.metadata?.hasSelectableText).toBe(true);
    expect(String(task.metadata?.extractedText)).toContain('Pagina 1 de prueba');
  });

  it('Tool 7: Convert PDF to Word', async () => {
    const res = await request(app)
      .post('/api/pdf-to-word')
      .attach('file', samplePdfBuffer, 'sample.pdf');

    expect(res.status).toBe(202);
    const task = await waitForTaskCompletion(res.body.taskId);
    expect(task.status).toBe('completed');
    expect(task.outputs[0].name).toContain('.docx');
  });

  it('Task Cleanup / DELETE endpoint', async () => {
    const res = await request(app)
      .post('/api/extract-pdf-text')
      .attach('file', samplePdfBuffer, 'sample.pdf');

    const taskId = res.body.taskId;
    await waitForTaskCompletion(taskId);

    const delRes = await request(app).delete(`/api/tasks/${taskId}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    const getRes = await request(app).get(`/api/tasks/${taskId}`);
    expect(getRes.status).toBe(404);
  });
});
