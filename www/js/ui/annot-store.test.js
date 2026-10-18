// Tests for the annotation store: add, erase, undo / redo across pages, export / import.
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { addItem, getItems, takeItems, recordErase, undoOp, redoOp, clearAnnots, exportAll, importAll } from './annot-store.js';
import { on } from '../core/bus.js';

const mark = (x) => ({ k: 'th', c: '#facc15', r: [[x, 0.1, 0.2, 0.02]] });
let last;
on('annotchange', (s) => { last = s; });
beforeEach(() => clearAnnots());

test('add then undo / redo', () => {
  const it = mark(0.1);
  addItem(2, it);
  assert.deepEqual(last, { undo: true, redo: false });
  assert.deepEqual(undoOp(), [2]);
  assert.equal(getItems(2).length, 0);
  assert.deepEqual(last, { undo: false, redo: true });
  assert.deepEqual(redoOp(), [2]);
  assert.deepEqual(getItems(2), [it]);
});
test('a new action clears the redo stack', () => {
  addItem(0, mark(0.1));
  undoOp();
  addItem(0, mark(0.2));
  assert.deepEqual(redoOp(), []);
});
test('erasing is one history step and restores items at their old positions', () => {
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
test('export / import round-trips and drops invalid items', () => {
  addItem(3, mark(0.1));
  const data = exportAll();
  assert.deepEqual(Object.keys(data), ['3']);
  data[7] = [{ k: 'evil', c: 'x' }];
  importAll(data);
  assert.equal(getItems(3).length, 1);
  assert.equal(getItems(7).length, 0);
  assert.deepEqual(undoOp(), []);
});
