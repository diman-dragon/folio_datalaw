// Test for closePdf: the loading task owns the document in pdf.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { closePdf } from './close-doc.js';

test('destroys the loading task of the document', async () => {
  let destroyed = 0;
  await closePdf({ loadingTask: { destroy: async () => { destroyed++; } } });
  assert.equal(destroyed, 1);
});
