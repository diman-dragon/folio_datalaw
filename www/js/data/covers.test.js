// Tests for the cover store: one storage key per document.
import test from 'node:test';
import assert from 'node:assert/strict';
const mem = new Map();
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
const { getCover, setCover, dropCover } = await import('./covers.js');

test('set, get and drop a cover', () => {
  assert.equal(getCover('a'), null);
  setCover('a', 'data:image/jpeg;base64,xx');
  assert.equal(getCover('a'), 'data:image/jpeg;base64,xx');
  dropCover('a');
  assert.equal(getCover('a'), null);
});
test('covers of different documents do not collide', () => {
  setCover('a', '1'); setCover('b', '2');
  assert.equal(getCover('a'), '1');
  assert.equal(getCover('b'), '2');
});
