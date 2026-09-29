'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('node:http');
const zlib = require('node:zlib');

const { negotiateEncoding, sendJson, sendBuffer, COMPRESSION_MIN_BYTES } = require('../../src/shared/http');

function fakeResponse(headers = {}) {
  const chunks = [];
  let settle;
  const finished = new Promise((resolve) => { settle = resolve; });
  const res = {
    req: { headers },
    destroyed: false,
    writableEnded: false,
    statusCode: null,
    headers: null,
    writeHead(code, value) { this.statusCode = code; this.headers = value; },
    end(body) {
      this.writableEnded = true;
      if (body !== undefined && body !== null) chunks.push(Buffer.isBuffer(body) ? body : Buffer.from(String(body)));
      settle();
    }
  };
  return { res, finished, body: () => Buffer.concat(chunks) };
}

test('negotiateEncoding prefers brotli, falls back to gzip, and honours q=0', () => {
  assert.equal(negotiateEncoding(fakeResponse({ 'accept-encoding': 'gzip, deflate, br' }).res), 'br');
  assert.equal(negotiateEncoding(fakeResponse({ 'accept-encoding': 'gzip' }).res), 'gzip');
  assert.equal(negotiateEncoding(fakeResponse({ 'accept-encoding': 'br' }).res), 'br');
  // Explicit refusal must win even when the name is present.
  assert.equal(negotiateEncoding(fakeResponse({ 'accept-encoding': 'gzip;q=0, br;q=0' }).res), null);
  // A stricter gzip preference is respected.
  assert.equal(negotiateEncoding(fakeResponse({ 'accept-encoding': 'br;q=0.1, gzip;q=1' }).res), 'gzip');
  // A wildcard may only be satisfied with gzip: br is opt-in.
  assert.equal(negotiateEncoding(fakeResponse({ 'accept-encoding': '*' }).res), 'gzip');
  assert.equal(negotiateEncoding(fakeResponse({}).res), null);
  assert.equal(negotiateEncoding(undefined), null);
});

test('sendJson emits compact JSON, not the 2-space format', () => {
  const { res, body } = fakeResponse({});
  sendJson(res, 200, { a: 1, nested: { b: [1, 2] } });
  assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
  assert.equal(body().toString('utf8'), '{"a":1,"nested":{"b":[1,2]}}');
});

test('sendJson states vary: accept-encoding so caches keep the encodings apart', () => {
  const { res } = fakeResponse({ 'accept-encoding': 'gzip' });
  sendJson(res, 200, { a: 1 });
  assert.equal(res.headers.vary, 'accept-encoding');
});

test('a large JSON body is gzipped when the client asks for it', async () => {
  const payload = { devices: Array.from({ length: 400 }, (_, i) => ({ deviceId: `d-${i}`, hostname: `h-${i}` })) };
  const raw = Buffer.from(JSON.stringify(payload));
  assert.ok(raw.length > COMPRESSION_MIN_BYTES);

  const { res, finished, body } = fakeResponse({ 'accept-encoding': 'gzip' });
  sendJson(res, 200, payload);
  await finished;

  assert.equal(res.headers['content-encoding'], 'gzip');
  assert.equal(Number(res.headers['content-length']), body().length);
  assert.ok(body().length < raw.length);
  assert.deepEqual(JSON.parse(zlib.gunzipSync(body()).toString('utf8')), payload);
});

test('brotli is chosen for a large body when the client advertises it', async () => {
  const payload = { devices: Array.from({ length: 400 }, (_, i) => ({ deviceId: `d-${i}`, note: 'x'.repeat(50) })) };
  const { res, finished, body } = fakeResponse({ 'accept-encoding': 'br' });
  sendJson(res, 200, payload);
  await finished;
  assert.equal(res.headers['content-encoding'], 'br');
  assert.deepEqual(JSON.parse(zlib.brotliDecompressSync(body()).toString('utf8')), payload);
});

test('a small body is sent uncompressed with a content-length', () => {
  const { res, body } = fakeResponse({ 'accept-encoding': 'gzip' });
  sendJson(res, 200, { ok: true });
  assert.equal(res.headers['content-encoding'], undefined);
  assert.equal(Number(res.headers['content-length']), body().length);
  assert.equal(body().toString('utf8'), '{"ok":true}');
});

test('a client that advertises no encoding gets the raw body', () => {
  const { res, body } = fakeResponse({});
  sendJson(res, 200, { ok: true, padding: 'x'.repeat(2000) });
  assert.equal(res.headers['content-encoding'], undefined);
  assert.ok(body().length > COMPRESSION_MIN_BYTES);
  assert.equal(Number(res.headers['content-length']), body().length);
});

test('compression failure falls back to the uncompressed body', async () => {
  const { res, finished, body } = fakeResponse({ 'accept-encoding': 'gzip' });
  // A non-encodable body is not constructible through sendJson; drive sendBuffer
  // directly with a monkey-patched gzip that fails after negotiation succeeded.
  const original = zlib.gzip;
  zlib.gzip = function stub(data, options, callback) {
    const done = typeof options === 'function' ? options : callback;
    done(new Error('boom'));
  };
  try {
    sendBuffer(res, 200, Buffer.from('x'.repeat(4096)), 'application/json');
    await finished;
  } finally {
    zlib.gzip = original;
  }
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['content-encoding'], undefined);
  assert.equal(body().length, 4096);
});

test('a client that disconnected mid-compression is not written to', async () => {
  const { res, body } = fakeResponse({ 'accept-encoding': 'gzip' });
  sendBuffer(res, 200, Buffer.from('x'.repeat(4096)), 'application/json');
  // The socket dies while the compression is still on the thread pool.
  res.destroyed = true;
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(body().length, 0);
});

test('sendJson round-trips through a real HTTP server for both encodings', async () => {
  const server = http.createServer((req, res) => {
    sendJson(res, 200, { echo: req.url, items: Array.from({ length: 300 }, (_, i) => i) });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    for (const encoding of ['gzip', 'br', 'identity']) {
      const response = await fetch(`http://127.0.0.1:${port}/probe`, { headers: { 'accept-encoding': encoding } });
      const parsed = await response.json();
      assert.equal(parsed.items.length, 300);
      assert.equal(parsed.echo, '/probe');
      if (encoding === 'identity') assert.equal(response.headers.get('content-encoding'), null);
      else assert.equal(response.headers.get('content-encoding'), encoding);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
