// Tests for errorText (Rust codes and pdf.js errors -> messages).
import test from 'node:test';
import assert from 'node:assert/strict';
import { errorText } from './error-text.js';
import { t } from '../core/strings.js';

test('rust codes map to messages', () => {
  assert.equal(errorText('not_found'), t('err.missing'));
  assert.equal(errorText('not_pdf'), t('err.invalid'));
  assert.equal(errorText('too_large'), t('err.large'));
  assert.equal(errorText('io: denied'), t('err.open'));
});
test('pdf.js invalid file maps to the invalid message', () => {
  assert.equal(errorText({ name: 'InvalidPDFException', message: 'x' }), t('err.invalid'));
});
test('cancelled password dialog says nothing', () => {
  assert.equal(errorText({ cancelled: true }), null);
});
test('unknown errors fall back to the generic message', () => {
  assert.equal(errorText(new Error('boom')), t('err.open'));
  assert.equal(errorText(undefined), t('err.open'));
});
