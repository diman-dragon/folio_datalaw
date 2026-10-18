// Tests for the OCR store (fake IndexedDB).
import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { saveOcr, loadAllOcr, dropOcr } from './ocr-store.js';

const page = (t) => ({ w: 500, h: 700, words: [[t, 10, 10, 50, 12]] });
test('saves and loads recognized pages of a document', async () => {
  await saveOcr('doc1', 0, page('a'));
  await saveOcr('doc1', 12, page('b'));
  const all = await loadAllOcr('doc1');
  assert.deepEqual(all.map(([i]) => i).sort((x, y) => x - y), [0, 12]);
  assert.equal(all.find(([i]) => i === 12)[1].words[0][0], 'b');
});
test('documents do not see each other\'s pages', async () => {
  await saveOcr('doc2', 3, page('x'));
  await saveOcr('doc2x', 4, page('y'));
  assert.deepEqual((await loadAllOcr('doc2')).map(([i]) => i), [3]);
});
test('saving a page again overwrites it', async () => {
  await saveOcr('doc3', 1, page('old'));
  await saveOcr('doc3', 1, page('new'));
  const all = await loadAllOcr('doc3');
  assert.equal(all.length, 1);
  assert.equal(all[0][1].words[0][0], 'new');
});
test('dropOcr removes only that document', async () => {
  await saveOcr('doc4', 0, page('a'));
  await saveOcr('doc5', 0, page('b'));
  await dropOcr('doc4');
  assert.equal((await loadAllOcr('doc4')).length, 0);
  assert.equal((await loadAllOcr('doc5')).length, 1);
});
