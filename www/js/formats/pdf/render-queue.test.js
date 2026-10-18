// Tests for the priority render queue.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createQueue } from './render-queue.js';

const tick = () => new Promise((r) => setTimeout(r, 5));
test('runs jobs by ascending priority, not insertion order', async () => {
  const q = createQueue(1);
  const ran = [];
  q.add('far', () => 9, async () => ran.push('far'));
  q.add('near', () => 1, async () => ran.push('near'));
  q.add('mid', () => 5, async () => ran.push('mid'));
  await tick();
  assert.deepEqual(ran, ['near', 'mid', 'far']);
});
test('respects the concurrency limit', async () => {
  const q = createQueue(2);
  let now = 0, peak = 0;
  const job = async () => { now++; peak = Math.max(peak, now); await tick(); now--; };
  for (let i = 0; i < 6; i++) q.add('k' + i, () => i, job);
  await tick(); await tick(); await tick(); await tick();
  assert.equal(peak, 2);
});
test('dropped jobs never run', async () => {
  const q = createQueue(1);
  const ran = [];
  q.add('a', () => 1, async () => ran.push('a'));
  q.add('b', () => 2, async () => ran.push('b'));
  q.drop('a');
  await tick();
  assert.deepEqual(ran, ['b']);
});
test('adding the same key replaces the pending job', async () => {
  const q = createQueue(1);
  const ran = [];
  q.add('a', () => 1, async () => ran.push('old'));
  q.add('a', () => 1, async () => ran.push('new'));
  await tick();
  assert.deepEqual(ran, ['new']);
});
test('priority is evaluated lazily at pick time', async () => {
  const q = createQueue(1);
  const ran = [];
  let focus = 'a';
  q.add('a', () => (focus === 'a' ? 0 : 9), async () => ran.push('a'));
  q.add('b', () => (focus === 'b' ? 0 : 9), async () => ran.push('b'));
  focus = 'b'; // scroll happened before the queue got to run
  await tick();
  assert.deepEqual(ran, ['b', 'a']);
});
test('a failing job does not stall the queue', async () => {
  const q = createQueue(1);
  const ran = [];
  q.add('bad', () => 1, async () => { throw new Error('x'); });
  q.add('ok', () => 2, async () => ran.push('ok'));
  await tick();
  assert.deepEqual(ran, ['ok']);
});
test('clear removes everything pending', async () => {
  const q = createQueue(1);
  q.add('a', () => 1, async () => {});
  q.clear();
  assert.equal(q.size(), 0);
});
