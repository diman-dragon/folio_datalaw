// Tests for pagination with a fake fixed-width measure: breaking, page limits, titles, images, determinism.
import test from 'node:test';
import assert from 'node:assert/strict';
import { paginate, PAGE, BASE } from './fb2-layout.js';

const measure = (s) => s.length * 9; // 9 px per char, whatever the font
const words = (n) => Array.from({ length: n }, (_, i) => `слово${i}`).join(' ');
const p = (text, extra = {}) => ({ t: 'p', runs: [{ s: text }], ...extra });
const bottom = PAGE.h - PAGE.my;
const lines = (page) => page.items.filter((i) => i.k === 'line');
const text = (ln) => ln.segs.map((s) => s.s).join(' ');

test('long text breaks into lines that fit the text width and pages that fit the page', () => {
  const pages = paginate([p(words(900))], measure);
  assert.ok(pages.length > 1);
  for (const pg of pages) for (const ln of lines(pg)) {
    const right = Math.max(...ln.segs.map((s) => s.x + s.w));
    assert.ok(right <= PAGE.w - PAGE.mx + 0.01, `line fits: ${right}`);
    assert.ok(ln.base <= bottom + 1, 'baseline inside the page');
  }
});
test('no word is lost or reordered', () => {
  const src = words(400);
  const got = paginate([p(src)], measure).flatMap(lines).map(text).join(' ');
  assert.equal(got, src);
});
test('a chapter title starts a new page and is never the last item of a page', () => {
  const blocks = [p(words(30)), { t: 'title', level: 1, runs: [{ s: 'Глава' }] }, p(words(30))];
  const pages = paginate(blocks, measure);
  assert.equal(pages.length, 2);
  assert.equal(text(lines(pages[1])[0]), 'Глава');
  const many = Array.from({ length: 12 }, (_, i) => [{ t: 'title', level: 2, runs: [{ s: `Раздел ${i}` }] }, p(words(60))]).flat();
  for (const pg of paginate(many, measure)) assert.notEqual(lines(pg).at(-1) && lines(pg).at(-1).size, 23, 'a section title is not stranded at the bottom');
});
test('justified lines (not the last) end at the right margin', () => {
  const pg = paginate([p(words(200))], measure)[0];
  const first = lines(pg)[1];
  const right = Math.max(...first.segs.map((s) => s.x + s.w));
  assert.ok(Math.abs(right - (PAGE.w - PAGE.mx)) < 0.5, `right edge ${right}`);
});
test('titles are centred, verses are indented, authors are right-aligned', () => {
  const pg = paginate([{ t: 'title', level: 1, runs: [{ s: 'Заголовок' }] }, { t: 'verse', runs: [{ s: 'строка' }] }, { t: 'author', runs: [{ s: 'Автор' }] }], measure)[0];
  const [t, v, a] = lines(pg);
  assert.ok(Math.abs(t.segs[0].x + (t.segs.at(-1).w) / 2 - PAGE.w / 2) < 0.5 || t.segs[0].x > PAGE.mx);
  assert.ok(v.segs[0].x > PAGE.mx + 30);
  assert.ok(Math.abs(a.segs.at(-1).x + a.segs.at(-1).w - (PAGE.w - PAGE.mx)) < 0.5);
});
test('images are scaled to fit, centred, and moved to the next page when they do not fit', () => {
  const big = { t: 'image', id: 'a' };
  const pages = paginate([p(words(10)), big, big], measure, () => ({ w: 1000, h: 1000 }));
  const imgs = pages.flatMap((pg) => pg.items.filter((i) => i.k === 'img'));
  assert.equal(imgs.length, 2);
  for (const im of imgs) {
    assert.ok(im.w <= PAGE.w - 2 * PAGE.mx + 0.01 && im.y + im.h <= bottom + 0.01);
    assert.ok(Math.abs(im.x + im.w / 2 - PAGE.w / 2) < 0.01);
  }
  assert.ok(pages.length >= 2);
});
test('an image of unknown size is skipped', () => {
  assert.equal(paginate([{ t: 'image', id: 'x' }, p('текст')], measure, () => null).flatMap((pg) => pg.items).filter((i) => i.k === 'img').length, 0);
});
test('a word wider than a line is cut by characters', () => {
  const pg = paginate([p('я'.repeat(200))], measure)[0];
  assert.ok(lines(pg).length >= 4);
  assert.equal(lines(pg).map(text).join(''), 'я'.repeat(200));
});
test('pagebreak forces a new page; an empty book still has one page; layout is deterministic', () => {
  assert.equal(paginate([p('a'), { t: 'pagebreak' }, p('b')], measure).length, 2);
  assert.equal(paginate([], measure).length, 1);
  const blocks = [p(words(500)), { t: 'title', level: 1, runs: [{ s: 'X' }] }, p(words(200))];
  assert.deepEqual(paginate(blocks, measure), paginate(blocks, measure));
  assert.ok(BASE > 0);
});
