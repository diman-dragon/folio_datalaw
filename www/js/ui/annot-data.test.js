// Tests for the annotation data layer: items, removal with positions, export / import with validation.
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getItems, pushItem, insertItem, takeItems, clearData, exportAll, importData } from './annot-data.js';

const mark = (x) => ({ k: 'th', c: '#facc15', r: [[x, 0.1, 0.2, 0.02]] });
beforeEach(() => clearData());

test('push and read per page', () => {
  const a = mark(0.1);
  pushItem(2, a);
  assert.deepEqual(getItems(2), [a]);
  assert.deepEqual(getItems(9), []);
});
test('takeItems removes only the given items; positions are those at removal time (undo replays them in reverse)', () => {
  const [a, b, c] = [mark(0.1), mark(0.2), mark(0.3)];
  [a, b, c].forEach((x) => pushItem(0, x));
  const out = takeItems(0, [a, c, mark(0.9)]);
  assert.deepEqual(out.map((r) => r.idx), [0, 1]);
  assert.deepEqual(getItems(0), [b]);
});
test('insertItem puts an item back at its old index', () => {
  const [a, b] = [mark(0.1), mark(0.2)];
  pushItem(0, b);
  insertItem(0, 0, a);
  assert.deepEqual(getItems(0), [a, b]);
});
test('export skips empty pages; import validates and replaces', () => {
  pushItem(3, mark(0.1));
  pushItem(4, mark(0.2));
  takeItems(4, getItems(4));
  const data = exportAll();
  assert.deepEqual(Object.keys(data), ['3']);
  data[7] = [{ k: 'evil', c: 'x' }];
  data.bad = [mark(0.5)];
  importData(data);
  assert.equal(getItems(3).length, 1);
  assert.equal(getItems(7).length, 0);
  assert.deepEqual(Object.keys(exportAll()), ['3']);
});
