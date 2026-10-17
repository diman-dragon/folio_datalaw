// Native "open" dialog for PDFs; resolves with an array of paths (empty when cancelled).
import { openDialog } from './bridge.js';
export async function pickPdfs() {
  const r = await openDialog({ multiple: true, filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (r == null) return [];
  return Array.isArray(r) ? r : [r];
}
