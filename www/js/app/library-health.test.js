// Tests for splitReadable (the Rust checker is faked through the bridge global).
import test from 'node:test';
import assert from 'node:assert/strict';
const docs = [{ id: 'a', path: '/a.pdf', pages: 3 }, { id: 'b', path: '/b.pdf', pages: 3 }, { id: 'c', path: '/c.pdf', pages: 0 }];
const withTauri = (fn) => { globalThis.window = { __TAURI__: { core: { invoke: fn } } }; };
const { splitReadable } = await import('./library-health.js');

test('missing files and page-less records are hidden', async () => {
  withTauri(async () => [true, false, true]);
  const { ok, hidden } = await splitReadable(docs);
  assert.deepEqual(ok.map((d) => d.id), ['a']);
  assert.deepEqual(hidden.map((d) => d.id), ['b', 'c']);
});
test('when the checker fails everything with pages is shown', async () => {
  withTauri(async () => { throw new Error('ipc'); });
  const { ok, hidden } = await splitReadable(docs);
  assert.deepEqual(ok.map((d) => d.id), ['a', 'b']);
  assert.deepEqual(hidden.map((d) => d.id), ['c']);
});
test('an empty library needs no check', async () => {
  withTauri(async () => { throw new Error('must not be called'); });
  assert.deepEqual(await splitReadable([]), { ok: [], hidden: [] });
});
