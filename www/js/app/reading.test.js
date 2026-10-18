// Tests for the "reading now" rule.
import test from 'node:test';
import assert from 'node:assert/strict';
import { isReading } from './reading.js';

test('a started, unfinished document is being read', () => {
  assert.ok(isReading({ lastPage: 5, pages: 20 }));
});
test('an unopened document (page 1) is not', () => {
  assert.ok(!isReading({ lastPage: 1, pages: 20 }));
  assert.ok(!isReading({ pages: 20 }));
});
test('a finished document (last page) is not', () => {
  assert.ok(!isReading({ lastPage: 20, pages: 20 }));
});
test('unknown page count still counts as reading once past page 1', () => {
  assert.ok(isReading({ lastPage: 3 }));
});
