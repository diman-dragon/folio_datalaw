// Tests for the undo / redo history: add, erase as one step, redo reset, cap, events.
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { addItem, recordErase, undoOp, redoOp, replaceAll, clearAll } from './annot-history.js';
import { getItems, takeItems } from './annot-data.js';
import { on } from '../core/bus.js';

const mark = (x) => ({ k: 'th', c: '#facc15', r: [[x, 0.1, 0.2, 0.02]] });
let last;
on('annotchange', (s) => { last = s; });
beforeEach(() => clearAll());

test('add then undo / redo with counts in the event', () => {
  const it = mark(0.1);
  addItem(2, it);
  assert.deepEqual(last, { undo: 1, redo: 0 });
  assert.deepEqual(undoOp(), [2]);
  assert.equal(getItems(2).length, 0);
  assert.deepEqual(last, { undo: 0, redo: 1 });
  assert.deepEqual(redoOp(), [2]);
  assert.deepEqual(getItems(2), [it]);
});
test('a new action clears the redo stack', () => {
  addItem(0, mark(0.1));
  undoOp();
  addItem(0, mark(0.2));
  assert.deepEqual(redoOp(), []);
});
test('erasing is one step and undo restores items at their old positions', () => {
  const [a, b, c] = [mark(0.1), mark(0.2), mark(0.3)];
  [a, b, c].forEach((x) => addItem(1, x));
  recordErase(takeItems(1, [a, c]));
  assert.deepEqual(getItems(1), [b]);
  undoOp();
  assert.deepEqual(getItems(1), [a, b, c]);
  redoOp();
  assert.deepEqual(getItems(1), [b]);
});
test('history spans pages', () => {
  addItem(0, mark(0.1));
  addItem(5, mark(0.2));
  assert.deepEqual(undoOp(), [5]);
  assert.deepEqual(undoOp(), [0]);
  assert.deepEqual(undoOp(), []);
});
test('an empty erase writes no history', () => {
  recordErase(takeItems(0, []));
  assert.deepEqual(undoOp(), []);
});
test('replaceAll loads stored data with an empty history', () => {
  addItem(3, mark(0.1));
  replaceAll({ 1: [mark(0.4)] });
  assert.equal(getItems(1).length, 1);
  assert.equal(getItems(3).length, 0);
  assert.deepEqual(last, { undo: 0, redo: 0 });
});
test('history is capped so memory stays bounded', () => {
  for (let i = 0; i < 1100; i++) addItem(0, mark(0.1));
  assert.equal(last.undo, 1000);
});
