import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('API Routes', () => {
  it('GET /api/health returns 200 and ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/tasks/:invalid returns 404', async () => {
    const res = await request(app).get('/api/tasks/non-existent-task-id');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /api/pdf-to-images without file returns 400 validation error', async () => {
    const res = await request(app).post('/api/pdf-to-images');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/merge-pdf with fewer than 2 files returns 400', async () => {
    const res = await request(app).post('/api/merge-pdf');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/storage/clean removes temporary entries and returns success', async () => {
    const res = await request(app).post('/api/storage/clean');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBeDefined();
    expect(typeof res.body.removedEntries).toBe('number');
  });
});
