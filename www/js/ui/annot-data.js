// Annotation items per page (0..1 page coordinates, so they scale with zoom). Pure data: no history, no events.
// Items: { k: 'pen'|'hl', c, w, p:[[x,y]..] } strokes; { k: 'th'|'tu', c, r:[[x,y,w,h]..] } text highlight / underline.
import { validItem } from './annot-valid.js';
const pages = new Map();
const list = (i) => { let l = pages.get(i); if (!l) pages.set(i, (l = [])); return l; };
export const getItems = (i) => pages.get(i) ?? [];
export const pushItem = (i, item) => { list(i).push(item); };
export const insertItem = (i, idx, item) => { list(i).splice(idx, 0, item); };
// Removes the given items and returns what was removed, with their old positions (for undo).
export function takeItems(i, items) {
  const l = list(i), out = [];
  items.forEach((item) => { const idx = l.indexOf(item); if (idx >= 0) { l.splice(idx, 1); out.push({ i, item, idx }); } });
  return out;
}
export const clearData = () => pages.clear();
export const exportAll = () => Object.fromEntries([...pages].filter(([, l]) => l.length));
// Replaces everything with stored data; invalid items are dropped (storage is untrusted input).
export function importData(data) {
  pages.clear();
  for (const [k, l] of Object.entries(data ?? {})) {
    const i = Number(k);
    if (Number.isInteger(i) && i >= 0 && Array.isArray(l)) pages.set(i, l.filter(validItem));
  }
}
