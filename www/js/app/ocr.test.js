// Tests for the OCR orchestration with a fake engine and renderer.
import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { recognizePage, recognizePages } from './ocr.js';
import { loadAllOcr } from '../data/ocr-store.js';
import { createTextSource } from '../formats/pdf/text-source.js';

// page 595x842 pt rendered into a 1190x1684 px canvas (k = 0.5 page units per px)
const render = async () => ({ canvas: { width: 1190 }, w: 595, h: 842 });
const engine = async () => [{ text: 'Договор', x0: 200, y0: 100, x1: 600, y1: 160 }];
const pdf = { getPage: async () => ({}) };
const noNative = async () => ({ w: 595, h: 842, chars: [] });
const mk = () => ({ pdf, meta: { id: 'doc' }, text: createTextSource(pdf, noNative) });

test('recognized words are converted from canvas px to page units, kept and stored', async () => {
  const a = mk();
  const data = await recognizePage(a, 'ocr-a', 0, ['rus'], () => {}, { recognize: engine, render });
  assert.deepEqual(data.words[0], ['Договор', 100, 50, 200, 30]);
  assert.equal((await a.text.getText(0)).chars.map((c) => c.ch).join(''), 'Договор');
  assert.equal((await loadAllOcr('ocr-a')).length, 1);
});
test('pages that already have text are skipped', async () => {
  const a = mk();
  a.text.setOcr(1, { w: 595, h: 842, words: [['x'.repeat(25), 0, 0, 100, 10]] });
  let calls = 0;
  const deps = { recognize: async () => { calls++; return []; }, render };
  const done = await recognizePages(a, 'ocr-b', [0, 1], ['eng'], { onPage: () => {}, cancelled: () => false, deps });
  assert.equal(done, 1);
  assert.equal(calls, 1);
});
test('cancelling stops before the next page', async () => {
  const a = mk();
  let stop = false, calls = 0;
  const deps = { recognize: async () => { calls++; stop = true; return []; }, render };
  const done = await recognizePages(a, 'ocr-c', [0, 1, 2], ['eng'], { onPage: () => {}, cancelled: () => stop, deps });
  assert.equal(done, 1);
  assert.equal(calls, 1);
});
test('progress is reported per page', async () => {
  const a = mk();
  const seen = [];
  await recognizePages(a, 'ocr-d', [0, 1], ['eng'], { onPage: (i, n) => seen.push([i, n]), cancelled: () => false, deps: { recognize: async () => [], render } });
  assert.deepEqual(seen, [[1, 2], [2, 2]]);
});
