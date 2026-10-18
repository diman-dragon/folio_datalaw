// Tests for the annotation persistence (localStorage is mocked).
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};
const { loadAnnots, saveAnnots, dropAnnots } = await import('./annot-db.js');
beforeEach(() => mem.clear());
const pages = { 0: [{ k: 'th', c: '#facc15', r: [[0.1, 0.1, 0.2, 0.02]] }] };

test('save then load round-trips', () => {
  assert.equal(saveAnnots('a', pages), true);
  assert.deepEqual(loadAnnots('a'), pages);
});
test('saving only empty pages removes the key', () => {
  saveAnnots('a', pages);
  saveAnnots('a', { 0: [] });
  assert.deepEqual(loadAnnots('a'), {});
  assert.equal(mem.has('folio.annot.a'), false);
});
test('corrupt or non-object data loads as empty', () => {
  mem.set('folio.annot.a', '{oops');
  assert.deepEqual(loadAnnots('a'), {});
  mem.set('folio.annot.b', '[1,2]');
  assert.deepEqual(loadAnnots('b'), {});
});
test('dropAnnots forgets a document', () => {
  saveAnnots('a', pages);
  dropAnnots('a');
  assert.deepEqual(loadAnnots('a'), {});
});
test('a full quota reports failure', () => {
  globalThis.localStorage.setItem = () => { throw new Error('quota'); };
  assert.equal(saveAnnots('a', pages), false);
});
