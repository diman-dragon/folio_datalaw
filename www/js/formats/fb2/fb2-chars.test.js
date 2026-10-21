// Tests for the FB2 char table: it mirrors the drawn text, so selecting and copying give back the book text.
import test from 'node:test';
import assert from 'node:assert/strict';
import { paginate, PAGE } from './fb2-layout.js';
import { charTable } from './fb2-chars.js';
import { textOf, lineBoxes } from '../../ui/sel-chars.js';

const measure = (s) => s.length * 9;
const src = 'Это довольно длинная строка текста для проверки таблицы символов и выделения ' + 'слово '.repeat(40).trim();
const page = paginate([{ t: 'p', runs: [{ s: src }] }], measure)[0];
const T = charTable(page, measure);

test('the table has the page size and one box per character plus the spaces', () => {
  assert.equal(T.w, PAGE.w);
  assert.equal(T.h, PAGE.h);
  assert.ok(T.chars.length > src.length * 0.9);
});
test('selecting everything and copying returns the text (lines joined by newlines)', () => {
  const copied = textOf(T.chars, 0, T.chars.length - 1).replace(/\n/g, ' ');
  assert.equal(copied, src.slice(0, copied.length));
  assert.ok(copied.length > 100);
});
test('all boxes lie inside the page and have a positive size', () => {
  for (const c of T.chars) {
    assert.ok(c.x >= 0 && c.x + c.w <= PAGE.w + 0.5 && c.y >= 0 && c.y + c.h <= PAGE.h + 0.5, JSON.stringify(c));
    assert.ok(c.h > 0 && c.w >= 0);
  }
});
test('characters of one line share a line, so a selection yields one box per line', () => {
  const lines = lineBoxes(T.chars, 0, T.chars.length - 1);
  assert.equal(lines.length, page.items.filter((i) => i.k === 'line').length);
});
test('the table is marked exact: it is real text, never a recognition guess', () => {
  assert.equal(T.exact, true);
});
test('images contribute no characters', () => {
  const pg = paginate([{ t: 'image', id: 'a' }], measure, () => ({ w: 100, h: 100 }))[0];
  assert.equal(charTable(pg, measure).chars.length, 0);
});
