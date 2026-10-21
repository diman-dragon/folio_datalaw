// Tests for the FB2 parser (jsdom provides DOMParser): metadata, block kinds, inline styles, notes, images, errors.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { parseFb2, runsOf, trimRuns } from './fb2-parse.js';
import { decodeXml } from './fb2-decode.js';

const dom = new JSDOM('');
const parseXml = (s) => new dom.window.DOMParser().parseFromString(s, 'application/xml');
const xml = decodeXml(new Uint8Array(fs.readFileSync(new URL('../../../../test-fixtures/book.fb2', import.meta.url))));
const book = parseFb2(xml, parseXml);
const text = (b) => b.runs.map((r) => r.s).join('');

test('metadata: author and title', () => {
  assert.equal(book.title, 'Тестовая книга');
  assert.equal(book.author, 'Иван Тестов');
});
test('the book starts with a title page (author, title, annotation) and a page break', () => {
  assert.deepEqual(book.blocks.slice(0, 2).map((b) => b.t), ['cover-author', 'cover-title']);
  assert.ok(book.blocks.some((b) => b.t === 'p' && b.quote && text(b).startsWith('Короткая аннотация')));
  assert.equal(book.blocks[book.blocks.findIndex((b) => b.t === 'pagebreak')].t, 'pagebreak');
});
test('chapters become level-1 titles with their paragraphs', () => {
  const titles = book.blocks.filter((b) => b.t === 'title').map(text);
  assert.deepEqual(titles, ['Глава 1', 'Глава 2', 'Глава 3', 'Примечания', '1']);
  assert.equal(book.blocks.filter((b) => b.t === 'p').length > 30, true);
});
test('inline styles and note references', () => {
  const p = book.blocks.find((b) => b.t === 'p' && text(b).includes('курсив'));
  assert.ok(p.runs.find((r) => r.s === 'курсив').i);
  assert.ok(p.runs.find((r) => r.s === 'жирный').b);
  const note = p.runs.find((r) => r.s === '[1]');
  assert.ok(note.sup && note.link);
});
test('poems give verses, a gap after the stanza and an author line', () => {
  const kinds = book.blocks.map((b) => b.t);
  const i = kinds.indexOf('verse');
  assert.deepEqual(kinds.slice(i, i + 4), ['verse', 'verse', 'gap', 'author']);
  assert.equal(text(book.blocks[i]), 'Выхожу один я на дорогу;');
});
test('images and the notes body', () => {
  assert.deepEqual(book.imageIds, ['pic1']);
  assert.ok(book.binaries.get('pic1').b64.length > 20 && book.binaries.get('pic1').type === 'image/png');
  const k = book.blocks.map((b) => b.t);
  assert.ok(k.includes('image') && text(book.blocks.at(-1)) === 'Текст примечания.');
});
test('runs collapse whitespace; trimRuns trims the ends only', () => {
  const doc = parseXml('<p xmlns="x">  a   <emphasis>b</emphasis>  </p>');
  const r = trimRuns(runsOf(doc.documentElement));
  assert.equal(r.map((x) => x.s).join(''), 'a b');
});
test('non-FB2 and malformed XML are rejected', () => {
  assert.throws(() => parseFb2('<html/>', parseXml), /not an FB2/);
  assert.throws(() => parseFb2('<FictionBook><body></FictionBook>', parseXml), /not an FB2/);
});
