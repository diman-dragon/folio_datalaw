// Tests for core/format.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileName, stripExt, isPdfPath, fmtSize, progress } from './format.js';

test('fileName handles windows and posix paths', () => {
  assert.equal(fileName('D:\\Docs\\Договор №1.pdf'), 'Договор №1.pdf');
  assert.equal(fileName('/home/u/a.pdf'), 'a.pdf');
  assert.equal(fileName('plain.pdf'), 'plain.pdf');
});
test('stripExt removes only the last extension', () => {
  assert.equal(stripExt('a.b.pdf'), 'a.b');
  assert.equal(stripExt('noext'), 'noext');
});
test('isPdfPath is case-insensitive', () => {
  assert.ok(isPdfPath('X.PDF'));
  assert.ok(!isPdfPath('x.pdf.txt'));
});
test('fmtSize picks the unit', () => {
  assert.equal(fmtSize(512), '512 B');
  assert.equal(fmtSize(2048), '2 KB');
  assert.equal(fmtSize(5 * 1048576), '5.0 MB');
});
test('progress is clamped and safe for unknown pages', () => {
  assert.equal(progress(5, 10), 50);
  assert.equal(progress(99, 10), 100);
  assert.equal(progress(1, 0), 0);
  assert.equal(progress(undefined, 4), 25);
});
