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

  it('GET returns default products array with 4-pack and 6-pack', async () => {
    const req = mockReq('GET');
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThanOrEqual(2);

    const fourPack = res.body.products.find((p) => p.boxSize === 4);
    const sixPack = res.body.products.find((p) => p.boxSize === 6);
    expect(fourPack).toBeDefined();
    expect(sixPack).toBeDefined();
  });

  it('GET returns default flavors array', async () => {
    const req = mockReq('GET');
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('flavors');
    expect(Array.isArray(res.body.flavors)).toBe(true);
    expect(res.body.flavors.length).toBeGreaterThanOrEqual(1);

    for (const f of res.body.flavors) {
      expect(f).toHaveProperty('id');
      expect(f).toHaveProperty('name');
      expect(f).toHaveProperty('image');
    }
  });

  it('POST without valid Authorization header returns 401', async () => {
    const req = mockReq('POST', { soldOut: true }, {});
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('POST with valid auth saves products', async () => {
    const password = process.env.ADMIN_PASSWORD || 'brownsugar2025';
    const newProducts = [
      { id: 1, name: 'Test 4-Pack', price: 25, boxSize: 4, description: 'test', image: '/test.jpg' },
    ];
    const req = mockReq(
      'POST',
      { products: newProducts },
      { authorization: `Bearer ${password}` },
    );
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.settings.products).toEqual(newProducts);
  });

  it('POST with valid auth saves flavors', async () => {
    const password = process.env.ADMIN_PASSWORD || 'brownsugar2025';
    const newFlavors = [
      { id: 'vanilla', name: 'Vanilla', image: '/images/vanilla.jpeg' },
      { id: 'chocolate', name: 'Chocolate', image: '/images/chocolate.jpeg' },
    ];
    const req = mockReq(
      'POST',
      { flavors: newFlavors },
      { authorization: `Bearer ${password}` },
    );
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.settings.flavors).toEqual(newFlavors);
  });

  it('unsupported method returns 405', async () => {
    const req = mockReq('DELETE');
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(405);
  });
});
