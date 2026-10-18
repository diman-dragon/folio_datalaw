// Text of the "import finished" message: only non-zero parts are listed.
import { t } from '../core/strings.js';
export function summary(ok, skipped, fail) {
  const parts = [`${t('lib.imported')}: ${ok}`];
  if (skipped) parts.push(`${t('lib.skipped')}: ${skipped}`);
  if (fail) parts.push(`${t('lib.failed')}: ${fail}`);
  return parts.join(', ');
}
