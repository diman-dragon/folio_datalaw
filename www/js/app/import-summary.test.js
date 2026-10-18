// Tests for the import summary text.
import test from 'node:test';
import assert from 'node:assert/strict';
import { summary } from './import-summary.js';

test('summary lists only non-zero parts', () => {
  assert.equal(summary(5, 0, 0), 'Добавлено: 5');
  assert.equal(summary(5, 2, 0), 'Добавлено: 5, уже были: 2');
  assert.equal(summary(0, 0, 3), 'Добавлено: 0, не удалось открыть: 3');
  assert.equal(summary(1, 2, 3), 'Добавлено: 1, уже были: 2, не удалось открыть: 3');
});
