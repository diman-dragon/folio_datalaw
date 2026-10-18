// Recognized text per document page: key "<docId>:<page>", value { w, h, words:[[text,x,y,w,h]..] } in page units.
import { tx, wait, finish } from './idb.js';
const range = (id) => IDBKeyRange.bound(`${id}:`, `${id};`);
export async function saveOcr(id, page, data) {
  const t = await tx(['ocr'], 'readwrite');
  t.objectStore('ocr').put(data, `${id}:${page}`);
  await finish(t);
}
export async function loadAllOcr(id) {
  const t = await tx(['ocr']);
  const s = t.objectStore('ocr'), r = range(id);
  const [keys, vals] = await Promise.all([wait(s.getAllKeys(r)), wait(s.getAll(r))]);
  return keys.map((k, i) => [Number(String(k).split(':')[1]), vals[i]]);
}
export async function dropOcr(id) {
  const t = await tx(['ocr'], 'readwrite');
  t.objectStore('ocr').delete(range(id));
  await finish(t);
}
