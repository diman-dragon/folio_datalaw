// Tests for the event bus.
import test from 'node:test';
import assert from 'node:assert/strict';
import { on, emit } from './bus.js';

test('handlers receive the payload; several handlers all run', () => {
  const seen = [];
  on('x1', (p) => seen.push(['a', p]));
  on('x1', (p) => seen.push(['b', p]));
  emit('x1', 7);
  assert.deepEqual(seen, [['a', 7], ['b', 7]]);
});
test('the returned function unsubscribes', () => {
  let n = 0;
  const off = on('x2', () => n++);
  emit('x2');
  off();
  emit('x2');
  assert.equal(n, 1);
});
test('emitting an event nobody listens to is harmless', () => {
  assert.doesNotThrow(() => emit('nobody-listens'));
});
