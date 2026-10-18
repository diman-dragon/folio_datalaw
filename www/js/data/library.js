// Library records (metadata only) in localStorage; files stay on disk and are referenced by path.
import { store } from '../core/storage.js';
const KEY = 'library';
function read() {
  try {
    const v = JSON.parse(store.get(KEY) ?? '[]');
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}
const write = (docs) => store.set(KEY, JSON.stringify(docs));
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const listDocs = () => read().sort((a, b) => (b.openedAt ?? 0) - (a.openedAt ?? 0));
export const getDoc = (id) => read().find((d) => d.id === id) ?? null;
export const getDocByPath = (path) => read().find((d) => d.path === path) ?? null;
export function updateDoc(id, patch) {
  const docs = read();
  const i = docs.findIndex((d) => d.id === id);
  if (i < 0) return null;
  docs[i] = { ...docs[i], ...patch };
  write(docs);
  return docs[i];
}
export function addDoc({ path, name, size, pages }) {
  const found = read().find((d) => d.path === path);
  if (found) return updateDoc(found.id, { name, size, pages, openedAt: Date.now() });
  const now = Date.now();
  const doc = { id: newId(), path, name, size, pages, lastPage: 1, zoom: null, addedAt: now, openedAt: now };
  write([doc, ...read()]);
  return doc;
}
export const removeDoc = (id) => write(read().filter((d) => d.id !== id));
