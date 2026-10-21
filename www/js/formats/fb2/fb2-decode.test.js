// Tests for decodeXml: windows-1251 from the declaration, UTF-8 with BOM, UTF-16, unknown labels.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { decodeXml } from './fb2-decode.js';

const fx = (n) => new Uint8Array(fs.readFileSync(new URL(`../../../../test-fixtures/${n}`, import.meta.url)));
test('windows-1251 declared in the XML header is decoded to Cyrillic', () => {
  const s = decodeXml(fx('book.fb2'));
  assert.ok(s.includes('Тестовая книга') && s.includes('Выхожу один я на дорогу'));
});
test('UTF-8 with a BOM loses the BOM', () => {
  const s = decodeXml(fx('book-utf8-bom.fb2'));
  assert.ok(s.startsWith('<?xml') && s.includes('Тестовая книга'));
});
test('UTF-16 with a BOM is decoded', () => {
  const s = decodeXml(new Uint8Array(Buffer.from('\ufeff<?xml version="1.0"?><a>Привет</a>', 'utf16le')));
  assert.ok(s.includes('Привет'));
});
test('an unknown encoding label falls back to UTF-8 instead of throwing', () => {
  const bytes = new TextEncoder().encode('<?xml version="1.0" encoding="no-such-enc"?><a>Привет</a>');
  assert.ok(decodeXml(bytes).includes('Привет'));
});
test('no declaration means UTF-8', () => {
  assert.equal(decodeXml(new TextEncoder().encode('<a>é</a>')), '<a>é</a>');
});
