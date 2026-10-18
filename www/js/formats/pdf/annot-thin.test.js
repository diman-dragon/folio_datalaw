// Tests for thin().
import test from 'node:test';
import assert from 'node:assert/strict';
import { thin } from './annot-thin.js';

test('short strokes are untouched', () => {
  const p = [[0, 0], [1, 1]];
  assert.equal(thin(p), p);
});
test('drops dense points but keeps the ends', () => {
  const p = Array.from({ length: 100 }, (_, i) => [i * 0.0001, 0]);
  const t = thin(p);
  assert.deepEqual(t[0], p[0]);
  assert.deepEqual(t.at(-1), p.at(-1));
  assert.ok(t.length < 20);
});
test('keeps well-spaced points', () => {
  const p = [[0, 0], [0.1, 0], [0.2, 0], [0.3, 0]];
  assert.equal(thin(p).length, 4);
});
