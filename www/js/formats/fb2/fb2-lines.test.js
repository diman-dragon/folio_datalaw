// Tests for the line engine: words from styled runs, greedy breaking, indent, alignment and justification.
import test from 'node:test';
import assert from 'node:assert/strict';
import { toWords, breakLines, placeLine } from './fb2-lines.js';

const measure = (s) => s.length * 10; // 10 px per character
const K = { size: 18, align: 'justify', indent: 0 };
const run = (s, extra = {}) => ({ s, ...extra });
const text = (line) => line.words.map((w) => w.segs.map((s) => s.s).join('')).join(' ');

test('runs without a space between them form one word with several styled segments', () => {
  const w = toWords([run('visit'), run('[1]', { sup: true, link: true }), run(' next')], K, measure);
  assert.equal(w.length, 2);
  assert.deepEqual(w[0].segs.map((s) => s.s), ['visit', '[1]']);
  assert.ok(w[0].segs[1].link && w[0].segs[1].dy < 0, 'a superscript note mark sits higher');
  assert.equal(w[0].w, 80);
  assert.equal(w[0].segs[1].x, 50, 'segments are positioned inside the word');
});
test('block bold / italic apply to every run; run styles are added on top', () => {
  const w = toWords([run('a'), run('b', { i: true })], { ...K, b: true }, measure);
  assert.ok(w[0].segs[0].font.includes('bold') && !w[1 - 1].segs[0].font.includes('italic'));
  assert.ok(w[1 - 1].segs[0].font);
});
test('greedy breaking keeps lines within the width and loses nothing', () => {
  const words = toWords([run('aaaa bbbb cccc dddd eeee ffff')], K, measure);
  const lines = breakLines(words, K, 100, measure); // 100px: two 40px words + a 10px space fit
  assert.deepEqual(lines.map(text), ['aaaa bbbb', 'cccc dddd', 'eeee ffff']);
  assert.ok(lines.every((l) => l.w <= 100));
});
test('the first line is shorter by the paragraph indent', () => {
  const words = toWords([run('aaaa bbbb cccc')], { ...K, indent: 2 }, measure); // indent = 2 * 18 = 36px
  const lines = breakLines(words, { ...K, indent: 2 }, 100, measure);
  assert.equal(text(lines[0]), 'aaaa');
  assert.equal(lines[0].indent, 36);
  assert.equal(lines[1].indent, 0);
});
test('a word wider than the line is cut by characters', () => {
  const lines = breakLines(toWords([run('x'.repeat(25))], K, measure), K, 100, measure);
  assert.ok(lines.length >= 3);
  assert.equal(lines.map(text).join(''), 'x'.repeat(25));
});
test('placeLine: justified lines reach the right edge, the last one does not', () => {
  const lines = breakLines(toWords([run('aaaa bbbb cccc dddd')], K, measure), K, 100, measure);
  const a = placeLine(lines[0], K, 50, 100), b = placeLine(lines[1], K, 50, 120);
  const right = (l) => Math.max(...l.segs.map((s) => s.x + s.w));
  assert.equal(right(a), 150);
  assert.ok(right(b) <= 150);
  assert.deepEqual(a.segs.map((s) => s.space), [false, true]);
});
test('placeLine: words advance along the line (never stacked) and alignment is honoured', () => {
  const k = { ...K, align: 'left' };
  const [l] = breakLines(toWords([run('aa bb cc')], k, measure), k, 400, measure);
  const xs = placeLine(l, k, 20, 50).segs.map((s) => s.x);
  assert.deepEqual(xs, [20, 50, 80]);
  const centre = placeLine(l, { ...k, align: 'center' }, 20, 50).segs[0].x;
  const right = placeLine(l, { ...k, align: 'right' }, 20, 50).segs[0].x;
  assert.ok(centre > 20 && right > centre);
});
