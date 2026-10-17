// Tests for pageAt (binary search over page tops).
import test from 'node:test';
import assert from 'node:assert/strict';
import { pageAt } from './page-at.js';

const tops = [0, 100, 250, 400];
const topOf = (i) => tops[i];
test('returns the page containing y', () => {
  assert.equal(pageAt(4, topOf, 0), 0);
  assert.equal(pageAt(4, topOf, 99), 0);
  assert.equal(pageAt(4, topOf, 100), 1);
  assert.equal(pageAt(4, topOf, 399), 2);
});
test('clamps beyond the ends', () => {
  assert.equal(pageAt(4, topOf, -50), 0);
  assert.equal(pageAt(4, topOf, 9999), 3);
});
test('single page', () => {
  assert.equal(pageAt(1, () => 0, 500), 0);
});
