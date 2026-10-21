// Tests for the library store (localStorage is mocked).
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};
const { addDoc, listDocs, getDoc, updateDoc, removeDoc } = await import('./library.js');
const rec = (path) => ({ path, name: path.split('/').pop(), size: 10, pages: 3 });
beforeEach(() => mem.clear());

test('addDoc creates a record with defaults', () => {
  const d = addDoc(rec('/a/x.pdf'));
  assert.equal(d.lastPage, 1);
  assert.equal(d.zoom, null);
  assert.equal(getDoc(d.id).path, '/a/x.pdf');
});
test('adding the same path again keeps one record and its progress', () => {
  const d = addDoc(rec('/a/x.pdf'));
  updateDoc(d.id, { lastPage: 7, zoom: 1.5 });
  const again = addDoc(rec('/a/x.pdf'));
  assert.equal(again.id, d.id);
  assert.equal(again.lastPage, 7);
  assert.equal(again.zoom, 1.5);
  assert.equal(listDocs().length, 1);
});
test('listDocs sorts by last opened, newest first', async () => {
  const a = addDoc(rec('/a.pdf'));
  const b = addDoc(rec('/b.pdf'));
  updateDoc(a.id, { openedAt: Date.now() + 1000 });
  assert.deepEqual(listDocs().map((d) => d.id), [a.id, b.id]);
});
test('removeDoc deletes only the chosen record', () => {
  const a = addDoc(rec('/a.pdf'));
  const b = addDoc(rec('/b.pdf'));
  removeDoc(a.id);
  assert.deepEqual(listDocs().map((d) => d.id), [b.id]);
});
test('updateDoc on a missing id returns null and does not recreate it', () => {
  assert.equal(updateDoc('nope', { lastPage: 2 }), null);
  assert.equal(listDocs().length, 0);
});
test('corrupt storage is treated as an empty library', () => {
  mem.set('folio.library', '{not json');
  assert.deepEqual(listDocs(), []);
});

test('kind and title are stored and refreshed, progress is kept', () => {
  const d = addDoc({ ...rec('/a/book.fb2'), kind: 'fb2', title: 'Автор — Книга' });
  assert.equal(d.kind, 'fb2');
  assert.equal(d.title, 'Автор — Книга');
  updateDoc(d.id, { lastPage: 4 });
  const again = addDoc({ ...rec('/a/book.fb2'), kind: 'fb2', title: 'Автор — Новая' });
  assert.equal(again.title, 'Автор — Новая');
  assert.equal(again.lastPage, 4);
});
test('a record without a kind is a PDF', () => {
  assert.equal(addDoc(rec('/a/x.pdf')).kind, 'pdf');
});
