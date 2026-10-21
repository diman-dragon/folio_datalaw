// Test: an FB2 whose page is only an image (a scanned book) has no text until OCR, then becomes selectable.
import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { openFb2 } from './fb2-doc.js';
import { createTextSource } from '../pdf/text-source.js';
import { recognizePages } from '../../app/ocr.js';
import { textOf } from '../../ui/sel-chars.js';

const dom = new JSDOM('');
const xml = `<?xml version="1.0" encoding="utf-8"?><FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
<description><title-info><book-title>Скан</book-title></title-info></description>
<body><section><image l:href="#s1"/></section></body><binary id="s1" content-type="image/png">AAAA</binary></FictionBook>`;
const deps = { measure: (s) => s.length * 9, parseXml: (s) => new dom.window.DOMParser().parseFromString(s, 'application/xml'), decodeImage: async () => ({ bitmap: {}, w: 800, h: 1100 }) };
const doc = await openFb2(new TextEncoder().encode(xml), deps);
const fake = { recognize: async () => [{ text: 'Распознано', x0: 100, y0: 200, x1: 500, y1: 260 }, { text: 'вручную', x0: 540, y0: 200, x1: 900, y1: 260 }], render: async () => ({ canvas: { width: 1080 }, w: 540, h: 780 }) };

test('the scan page is an image; the title page has its own text', async () => {
  assert.equal(doc.numPages, 2);
  const text = createTextSource(doc);
  assert.equal(await text.hasText(0), true, 'title page is text');
  assert.equal(await text.hasText(1), false, 'the image page has no text layer');
  assert.equal((await text.getText(1)).chars.length, 0);
});
test('after OCR the image page can be selected and copied', async () => {
  const text = createTextSource(doc);
  const active = { pdf: doc, text, meta: { id: 'scan' } };
  const done = await recognizePages(active, 'scan', [0, 1], ['rus'], { onPage: () => {}, cancelled: () => false, deps: fake });
  assert.equal(done, 1, 'only the image page needed recognition');
  const T = await text.getText(1);
  assert.equal(textOf(T.chars, 0, T.chars.length - 1), 'Распознано вручную');
  assert.equal(T.w, 540, 'recognized coordinates live in page units');
});
