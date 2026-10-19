// Tests for createWorkerOf, including the real vendored tesseract build when it is installed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createWorkerOf } from './ocr-module.js';

const vendored = new URL('../../vendor/tesseract/tesseract.esm.min.js', import.meta.url);
test('takes a named export when present', () => {
  const fn = () => {};
  assert.equal(createWorkerOf({ createWorker: fn }), fn);
});
test('falls back to the default export (the vendored ESM build)', () => {
  const fn = () => {};
  assert.equal(createWorkerOf({ default: { createWorker: fn } }), fn);
});
test('fails with a clear message when there is no createWorker', () => {
  assert.throws(() => createWorkerOf({ default: {} }), /no createWorker/);
  assert.throws(() => createWorkerOf(undefined), /no createWorker/);
});
test('works with the real vendored tesseract build', { skip: !fs.existsSync(vendored) && 'run pnpm install first (fetches OCR)' }, async () => {
  globalThis.self ??= globalThis; // the UMD wrapper expects a browser-like global
  const mod = await import(vendored.href);
  assert.equal(typeof createWorkerOf(mod), 'function');
});
