// Tests for the ZIP reader, on real archives made by Python (deflated, stored, nested name, without fb2).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { isZip, unzipFb2 } from './fb2-zip.js';

const fx = (n) => new Uint8Array(fs.readFileSync(new URL(`../../../../test-fixtures/${n}`, import.meta.url)));
const raw = fx('book.fb2');

test('isZip recognises the local header signature only', () => {
  assert.ok(isZip(fx('book.fb2.zip')));
  assert.ok(!isZip(raw));
  assert.ok(!isZip(new Uint8Array([0x50, 0x4b])));
});
test('a deflated entry comes back byte for byte', async () => {
  assert.deepEqual(await unzipFb2(fx('book.fb2.zip')), raw);
});
test('a stored entry in a sub-folder with another letter case is found', async () => {
  assert.deepEqual(await unzipFb2(fx('book-stored.fb2.zip')), raw);
});
test('an archive without an .fb2 fails clearly', async () => {
  await assert.rejects(unzipFb2(fx('no-fb2.zip')), /no \.fb2 inside/);
});
test('garbage is not an archive', async () => {
  await assert.rejects(unzipFb2(new Uint8Array(64)), /no central directory/);
});
