// Tests for typed preferences.
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
const mem = new Map();
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
const { getPref, setPref } = await import('./prefs.js');
beforeEach(() => mem.clear());

test('returns the fallback when nothing is stored', () => {
  assert.equal(getPref('x', 5), 5);
});
test('stores booleans, numbers, arrays and objects as JSON', () => {
  setPref('b', false); setPref('n', 3); setPref('a', ['eng', 'rus']); setPref('o', { fx: 1 });
  assert.equal(getPref('b', true), false);
  assert.equal(getPref('n', 0), 3);
  assert.deepEqual(getPref('a', []), ['eng', 'rus']);
  assert.deepEqual(getPref('o', {}), { fx: 1 });
});
test('corrupt JSON falls back instead of throwing', () => {
  mem.set('folio.pref.bad', '{oops');
  assert.equal(getPref('bad', 'fb'), 'fb');
});
