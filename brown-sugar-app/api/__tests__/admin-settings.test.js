import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock @vercel/blob before importing the handler
vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({ url: 'https://blob.test/settings.json' }),
  head: vi.fn().mockRejectedValue(new Error('not found')),
}));

import handler from '../admin-settings.js';

function mockReq(method, body = {}, headers = {}) {
  return { method, body, headers };
}

function mockRes() {
  const res = {
    statusCode: null,
    headers: {},
    body: null,
    setHeader(key, val) { res.headers[key] = val; return res; },
    status(code) { res.statusCode = code; return res; },
    json(data) { res.body = data; return res; },
    end() { return res; },
  };
  return res;
}

describe('admin-settings API handler', () => {

  it('GET returns 200 with settings containing soldOut, orderCount, orderLimit, pickupOptions', async () => {
    const req = mockReq('GET');
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('soldOut');
    expect(res.body).toHaveProperty('orderCount');
    expect(res.body).toHaveProperty('orderLimit');
    expect(res.body).toHaveProperty('pickupOptions');
  });

  it('POST without valid Authorization header returns 401', async () => {
    const req = mockReq('POST', { soldOut: true }, {});
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });
});
