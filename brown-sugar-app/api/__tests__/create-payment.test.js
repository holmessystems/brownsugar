import { describe, it, expect } from 'vitest';
import handler from '../create-payment.js';

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

describe('create-payment API handler', () => {
  it('returns 400 with "Missing payment source" when sourceId is missing', async () => {
    const req = mockReq('POST', { cart: [{ name: 'Classic', price: 20, qty: 1 }] });
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing payment source');
  });

  it('returns 400 with "Cart is empty" when cart is empty', async () => {
    const req = mockReq('POST', { sourceId: 'cnon:card-nonce-ok', cart: [] });
    const res = mockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Cart is empty');
  });
});
