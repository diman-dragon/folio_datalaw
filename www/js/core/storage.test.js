// Tests for the storage wrapper: prefixed keys, success flag, never throws.
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
const mem = new Map();
const real = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
globalThis.localStorage = real;
const { store } = await import('./storage.js');
beforeEach(() => { mem.clear(); globalThis.localStorage = real; });

test('keys are prefixed and values round-trip', () => {
  assert.equal(store.set('a', '1'), true);
  assert.equal(store.get('a'), '1');
  assert.equal(mem.get('folio.a'), '1');
  store.del('a');
  assert.equal(store.get('a'), null);
});
test('a failing storage reports false / null instead of throwing', () => {
  globalThis.localStorage = { getItem() { throw new Error('x'); }, setItem() { throw new Error('quota'); }, removeItem() { throw new Error('x'); } };
  assert.equal(store.set('a', '1'), false);
  assert.equal(store.get('a'), null);
  assert.doesNotThrow(() => store.del('a'));
});
