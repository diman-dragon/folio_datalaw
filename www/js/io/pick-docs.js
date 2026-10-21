// Native "open" dialog for documents; resolves with an array of paths (empty when cancelled).
import { openDialog } from './bridge.js';
export async function pickDocs() {
  const r = await openDialog({ multiple: true, filters: [{ name: 'Книги и документы (PDF, FB2)', extensions: ['pdf', 'fb2', 'zip'] }] });
  if (r == null) return [];
  return Array.isArray(r) ? r : [r];
}
