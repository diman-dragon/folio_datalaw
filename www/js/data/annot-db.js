// Annotations of one document persisted in localStorage (one key per library id): { pageIndex: items[] }.
import { store } from '../core/storage.js';
const key = (id) => 'annot.' + id;
export function loadAnnots(id) {
  try {
    const v = JSON.parse(store.get(key(id)) ?? 'null');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch { return {}; }
}
export function saveAnnots(id, pages) {
  if (Object.values(pages).every((list) => !list.length)) { store.del(key(id)); return true; }
  return store.set(key(id), JSON.stringify(pages));
}
export const dropAnnots = (id) => store.del(key(id));
