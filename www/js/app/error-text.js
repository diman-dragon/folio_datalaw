// Maps open errors (Rust codes, pdf.js errors) to a short user-facing message; null = say nothing.
import { t } from '../core/strings.js';
export function errorText(e) {
  if (e?.cancelled) return null;
  const m = typeof e === 'string' ? e : (e?.message ?? '');
  if (m.startsWith('not_found')) return t('err.missing');
  if (m.startsWith('too_large')) return t('err.large');
  if (m.startsWith('not_doc') || m.startsWith('not_pdf') || e?.name === 'InvalidPDFException') return t('err.invalid');
  return t('err.open');
}
