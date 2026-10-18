// Tests for validItem.
import test from 'node:test';
import assert from 'node:assert/strict';
import { validItem } from './annot-valid.js';

const stroke = { k: 'pen', c: '#2563eb', w: 0.004, p: [[0.1, 0.2], [0.3, 0.4]] };
const mark = { k: 'th', c: '#facc15', r: [[0.1, 0.1, 0.5, 0.02]] };
test('accepts well-formed strokes and marks', () => {
  assert.ok(validItem(stroke));
  assert.ok(validItem(mark));
  assert.ok(validItem({ ...mark, k: 'tu' }));
});
test('rejects unknown kinds and bad colours', () => {
  assert.ok(!validItem({ ...stroke, k: 'script' }));
  assert.ok(!validItem({ ...stroke, c: 'red" onload="x' }));
  assert.ok(!validItem({ ...stroke, c: 5 }));
});
test('rejects broken geometry', () => {
  assert.ok(!validItem({ ...stroke, p: [] }));
  assert.ok(!validItem({ ...stroke, p: [[0.1, 'a']] }));
  assert.ok(!validItem({ ...stroke, w: NaN }));
  assert.ok(!validItem({ ...mark, r: [[0.1, 0.1, 0.5]] }));
  assert.ok(!validItem(null));
});
