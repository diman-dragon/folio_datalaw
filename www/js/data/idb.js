// IndexedDB access: one database "folio" with an "ocr" store (recognized text is too big for localStorage).
let opened;
export function db() {
  opened ??= new Promise((resolve, reject) => {
    const req = indexedDB.open('folio', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('ocr');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return opened;
}
export const wait = (req) => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
export const finish = (t) => new Promise((res, rej) => { t.oncomplete = () => res(); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
export async function tx(stores, mode = 'readonly') {
  return (await db()).transaction(stores, mode);
}
