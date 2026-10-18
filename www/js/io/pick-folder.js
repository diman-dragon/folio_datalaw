// Native "choose folder" dialog; resolves with the folder path or null when cancelled.
import { openDialog } from './bridge.js';
export async function pickFolder() {
  const r = await openDialog({ directory: true, multiple: false });
  return Array.isArray(r) ? (r[0] ?? null) : (r ?? null);
}
