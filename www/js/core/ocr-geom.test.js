// Tests for turning OCR words into a selectable char table.
import test from 'node:test';
import assert from 'node:assert/strict';
import { wordsToChars, ocrText } from './ocr-geom.js';

const words = [['Hello', 10, 100, 100, 20], ['world', 120, 101, 100, 20], ['next', 10, 150, 80, 20]];
test('each letter gets a box inside its word box', () => {
  const c = wordsToChars([words[0]]);
  assert.equal(c.map((x) => x.ch).join(''), 'Hello');
  assert.ok(Math.abs(c.reduce((s, x) => s + x.w, 0) - 100) < 1e-9);
  assert.ok(c.every((x) => x.x >= 10 && x.x + x.w <= 110.0001));
});
test('words on the same line are joined with a space, new lines are not', () => {
  const c = wordsToChars(words).map((x) => x.ch).join('');
  assert.equal(c, 'Hello world' + 'next');
});
test('narrow letters get less width than wide ones', () => {
  const [i, m] = wordsToChars([['im', 0, 0, 100, 10]]);
  assert.ok(i.w < m.w);
});
test('ocrText carries the page size', () => {
  const T = ocrText({ w: 500, h: 700, words: [words[0]] });
  assert.equal(T.w, 500);
  assert.equal(T.h, 700);
  assert.equal(T.chars.length, 5);
});
