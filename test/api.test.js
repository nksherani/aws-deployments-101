const test = require('node:test');
const assert = require('node:assert');
const { handleRequest } = require('../src/mockController');
const { handler } = require('../src/lambda');

test('GET /products returns list of items', () => {
  const res = handleRequest({ method: 'GET', path: '/products' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.items));
});

test('GET /health returns 200 with service status', () => {
  const res = handleRequest({ method: 'GET', path: '/health' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'UP');
});

test('POST /products adds a new product', () => {
  const res = handleRequest({
    method: 'POST',
    path: '/products',
    body: { name: 'AWS Cloud Cap', price: 19.99, category: 'apparel' }
  });
  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.data.item.name, 'AWS Cloud Cap');
});

test('GET /openapi.json returns valid OpenAPI 3 spec', () => {
  const res = handleRequest({ method: 'GET', path: '/openapi.json' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.openapi, '3.0.3');
  assert.ok(res.data.paths['/products']);
});

test('Lambda handler processes event correctly', async () => {
  const event = {
    rawPath: '/products',
    requestContext: { http: { method: 'GET' } }
  };
  const response = await handler(event, {});
  assert.strictEqual(response.statusCode, 200);
  const parsed = JSON.parse(response.body);
  assert.strictEqual(parsed.success, true);
});
