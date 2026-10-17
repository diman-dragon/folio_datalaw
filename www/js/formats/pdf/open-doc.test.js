// Integration test: openPdf with the real vendored pdf.js (skipped until `pnpm install` vendors it).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const vendored = fs.existsSync(new URL('../../../vendor/pdfjs/pdf.min.mjs', import.meta.url));
const bytes = (name) => new Uint8Array(fs.readFileSync(new URL(`../../../../test-fixtures/${name}`, import.meta.url)));
const opts = { skip: !vendored && 'run pnpm install first (vendors pdf.js)' };

test('opens a plain PDF and reports page count and sizes', opts, async () => {
  const { openPdf } = await import('./open-doc.js');
  const pdf = await openPdf(bytes('three-pages.pdf'));
  assert.equal(pdf.numPages, 3);
  const [a, c] = [await pdf.getPage(1), await pdf.getPage(3)];
  assert.ok(a.getViewport({ scale: 1 }).width < c.getViewport({ scale: 1 }).width);
  await pdf.loadingTask.destroy();
});

test('asks for a password and opens with the right one', opts, async () => {
  const { openPdf } = await import('./open-doc.js');
  const calls = [];
  const askPassword = async (wrong) => { calls.push(wrong); return wrong ? 'secret' : 'nope'; };
  const pdf = await openPdf(bytes('locked.pdf'), { askPassword });
  assert.deepEqual(calls, [false, true]);
  assert.equal(pdf.numPages, 3);
  await pdf.loadingTask.destroy();
});

test('cancelling the password dialog rejects with cancelled', opts, async () => {
  const { openPdf } = await import('./open-doc.js');
  await assert.rejects(openPdf(bytes('locked.pdf'), { askPassword: async () => null }), (e) => e.cancelled === true);
});

test('without a password callback a locked PDF counts as cancelled', opts, async () => {
  const { openPdf } = await import('./open-doc.js');
  await assert.rejects(openPdf(bytes('locked.pdf')), (e) => e.cancelled === true);
});

test('a non-PDF rejects with InvalidPDFException', opts, async () => {
  const { openPdf } = await import('./open-doc.js');
  await assert.rejects(openPdf(new TextEncoder().encode('hello, not a pdf')), (e) => e.name === 'InvalidPDFException');
});
