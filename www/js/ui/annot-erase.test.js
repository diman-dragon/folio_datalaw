// Tests for the stroke eraser hit logic and removal (R = page height / width).
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { touches, eraseSegment } from './annot-erase.js';
import { pushItem, getItems, clearData } from './annot-data.js';

const R = 1.4;
const stroke = { k: 'pen', c: '#2563eb', w: 0.004, p: [[0.2, 0.2], [0.6, 0.2]] };
const mark = { k: 'th', c: '#facc15', r: [[0.1, 0.5, 0.4, 0.02]] };
beforeEach(() => clearData());

test('a segment crossing a stroke touches it; a far one does not', () => {
  assert.ok(touches(stroke, [0.4, 0.15], [0.4, 0.25], R, 0.01));
  assert.ok(!touches(stroke, [0.4, 0.5], [0.4, 0.6], R, 0.01));
});
test('a segment over a text mark touches it', () => {
  assert.ok(touches(mark, [0.2, 0.49], [0.3, 0.52], R, 0.005));
  assert.ok(!touches(mark, [0.7, 0.49], [0.8, 0.52], R, 0.005));
});
test('eraseSegment removes only touched items and reports them', () => {
  pushItem(0, stroke);
  pushItem(0, mark);
  const removed = eraseSegment(0, [0.4, 0.15], [0.4, 0.25], R, 0.01);
  assert.equal(removed.length, 1);
  assert.deepEqual(getItems(0), [mark]);
});

import { segSeg } from './annot-erase.js';
test('segSeg: crossing segments are at distance 0, parallel ones at their gap', () => {
  assert.equal(segSeg([0, 0], [1, 1], [0, 1], [1, 0]), 0);
  assert.ok(Math.abs(segSeg([0, 0], [1, 0], [0, 0.5], [1, 0.5]) - 0.5) < 1e-9);
});
test('a long sparse stroke (two points) is still erased by a segment crossing its middle', () => {
  assert.ok(touches({ k: 'pen', c: '#000000', w: 0.004, p: [[0.05, 0.3], [0.95, 0.3]] }, [0.5, 0.25], [0.5, 0.35], R, 0.01));
});
