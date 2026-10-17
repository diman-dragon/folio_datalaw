// Tests for the zoom math.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, stepUp, stepDown, fitWidth, MIN, MAX } from './zoom.js';

test('clamp keeps zoom inside limits', () => {
  assert.equal(clamp(0.01), MIN);
  assert.equal(clamp(99), MAX);
  assert.equal(clamp(1.3), 1.3);
});
test('stepUp / stepDown walk the step table', () => {
  assert.equal(stepUp(1), 1.1);
  assert.equal(stepDown(1), 0.9);
  assert.equal(stepUp(1.2), 1.25);
  assert.equal(stepDown(1.2), 1.1);
});
test('steps stop at the limits', () => {
  assert.equal(stepUp(MAX), MAX);
  assert.equal(stepDown(MIN), MIN);
});
test('fitWidth divides available width by page width', () => {
  assert.equal(fitWidth(800, 400), 2);
  assert.equal(fitWidth(100, 1000), MIN);
});
