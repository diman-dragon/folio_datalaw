// Tests for the text source: native text wins, OCR fills pages without text.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTextSource } from './text-source.js';

const longText = { w: 500, h: 700, chars: Array.from({ length: 40 }, (_, i) => ({ ch: 'a', x: i, y: 0, w: 1, h: 1 })) };
const noText = { w: 500, h: 700, chars: [] };
const pdf = { getPage: async (n) => ({ n }) };
const native = async (page) => (page.n === 1 ? longText : noText);
const ocrData = { w: 500, h: 700, words: [['Recognized', 10, 10, 200, 20], ['text', 220, 10, 60, 20]] };

test('a page with a native text layer uses it', async () => {
  const s = createTextSource(pdf, native);
  assert.equal(await s.getText(0), longText);
  assert.equal(await s.hasText(0), true);
});
test('a scanned page has no text until it is recognized', async () => {
  const s = createTextSource(pdf, native);
  assert.equal(await s.hasText(1), false);
  assert.equal((await s.getText(1)).chars.length, 0);
  s.setOcr(1, ocrData);
  assert.equal(await s.hasText(1), true);
  assert.equal((await s.getText(1)).chars.map((c) => c.ch).join(''), 'Recognized text');
});
test('native text still wins over OCR when both exist', async () => {
  const s = createTextSource(pdf, native);
  s.setOcr(0, ocrData);
  assert.equal(await s.getText(0), longText);
});
test('native text is computed once per page', async () => {
  let calls = 0;
  const s = createTextSource(pdf, async (p) => { calls++; return native(p); });
  await s.getText(0); await s.getText(0); await s.hasText(0);
  assert.equal(calls, 1);
});

test('an exact table (FB2) counts as text even when it is short, a short PDF table does not', async () => {
  const short = { w: 540, h: 780, chars: [{ ch: 'a', x: 0, y: 0, w: 1, h: 1 }] };
  const exact = createTextSource(pdf, async () => ({ ...short, exact: true }));
  assert.equal(await exact.hasText(0), true);
  const plain = createTextSource(pdf, async () => short);
  assert.equal(await plain.hasText(0), false);
});
test('by default FB2-style pages supply their own char table (page.chars)', async () => {
  const fb2Page = { chars: async () => longText };
  const s = createTextSource({ getPage: async () => fb2Page });
  assert.equal(await s.getText(0), longText);
  assert.equal(await s.hasText(0), true);
});
