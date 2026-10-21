// Tests for openFb2 on the real fixtures (plain, zipped, UTF-8): the pdf.js-like interface the viewer relies on.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { openFb2 } from './fb2-doc.js';
import { PAGE } from './fb2-layout.js';

const dom = new JSDOM('');
const fx = (n) => new Uint8Array(fs.readFileSync(new URL(`../../../../test-fixtures/${n}`, import.meta.url)));
const deps = (extra = {}) => ({
  measure: (s) => s.length * 9,
  parseXml: (s) => new dom.window.DOMParser().parseFromString(s, 'application/xml'),
  decodeImage: async () => ({ bitmap: { close() {} }, w: 40, h: 30 }),
  ...extra,
});
const doc = await openFb2(fx('book.fb2'), deps());

test('the book becomes several pages and exposes author and title', () => {
  assert.ok(doc.numPages >= 6, `pages: ${doc.numPages}`);
  assert.equal(doc.kind, 'fb2');
  assert.equal(doc.title, 'Иван Тестов — Тестовая книга');
});
test('plain, zipped, stored-zip and UTF-8 variants give the same book', async () => {
  for (const name of ['book.fb2.zip', 'book-stored.fb2.zip', 'book-utf8-bom.fb2']) {
    assert.equal((await openFb2(fx(name), deps())).numPages, doc.numPages, name);
  }
});
test('pages have pdf.js-like viewports that scale', async () => {
  const page = await doc.getPage(1);
  const v = page.getViewport({ scale: 2 });
  assert.deepEqual([v.width, v.height, v.scale], [PAGE.w * 2, PAGE.h * 2, 2]);
});
test('render applies the zoom as a transform and draws text', async () => {
  const calls = [];
  const ctx = new Proxy({}, { get: (t, k) => (...a) => calls.push([k, ...a]), set: () => true });
  const page = await doc.getPage(2);
  const job = page.render({ canvas: { getContext: () => ctx }, viewport: page.getViewport({ scale: 1.5 }) });
  await job.promise;
  assert.deepEqual(calls[0], ['setTransform', 1.5, 0, 0, 1.5, 0, 0]);
  assert.ok(calls.some((c) => c[0] === 'fillText'));
  assert.equal(typeof job.cancel, 'function');
});
test('the text layer of a page gives selectable characters', async () => {
  const T = await (await doc.getPage(2)).chars();
  assert.equal(T.w, PAGE.w);
  assert.ok(T.chars.length > 200);
});
test('the poem, the note mark and the notes body are all in the book', async () => {
  let all = '';
  for (let n = 1; n <= doc.numPages; n++) all += (await (await doc.getPage(n)).chars()).chars.map((c) => c.ch).join('');
  for (const piece of ['Выхожу', '[1]', 'Текст примечания', 'Глава3']) assert.ok(all.replace(/ /g, '').includes(piece.replace(/ /g, '')), piece);
});
test('out-of-range pages fail; a book without usable images still opens; destroy releases images', async () => {
  await assert.rejects(doc.getPage(0), /out of range/);
  await assert.rejects(doc.getPage(doc.numPages + 1), /out of range/);
  const noImg = await openFb2(fx('book.fb2'), deps({ decodeImage: async () => { throw new Error('no decoder'); } }));
  assert.ok(noImg.numPages > 0);
  let closed = 0;
  const d2 = await openFb2(fx('book.fb2'), deps({ decodeImage: async () => ({ bitmap: { close: () => { closed++; } }, w: 40, h: 30 }) }));
  await d2.loadingTask.destroy();
  assert.equal(closed, 1);
});
test('a non-FB2 payload is rejected', async () => {
  await assert.rejects(openFb2(new TextEncoder().encode('<html/>'), deps()), /not an FB2/);
});
