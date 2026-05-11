import { describe, it, expect } from 'vitest';
import handler from '../admin-login.js';

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

describe('admin-login API handler', () => {
  // ADMIN_PASSWORD is captured at module load time, so we use the fallback default
  const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD || 'brownsugar2025';

  it('returns 200 with success when password is correct', async () => {
    const req = mockReq('POST', { password: CORRECT_PASSWORD });
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 401 with error when password is wrong', async () => {
    const req = mockReq('POST', { password: 'wrongpassword' });
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid password');
  });

  it('returns 405 for non-POST methods', async () => {
    const req = mockReq('GET');
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(405);
  });
});
