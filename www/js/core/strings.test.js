// Tests for the string table: lookup, fallback to the key, placeholders used by the OCR progress text.
import test from 'node:test';
import assert from 'node:assert/strict';
import { t } from './strings.js';

test('known keys translate', () => {
  assert.equal(t('viewer.copied'), 'Скопировано');
});
test('unknown keys fall back to the key itself', () => {
  assert.equal(t('no.such.key'), 'no.such.key');
});
test('the OCR progress text keeps its placeholders', () => {
  const s = t('ocr.progress');
  assert.ok(s.includes('{i}') && s.includes('{n}') && s.includes('{p}'));
});
test('every OCR language chip has a label', () => {
  for (const c of ['rus', 'eng', 'ita', 'srp', 'srp_latn']) assert.notEqual(t(`ocr.lang.${c}`), `ocr.lang.${c}`);
});
