// Tests for drawPage with a recording canvas context: paper, text segments with their fonts, links, images.
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawPage, PAPER, INK, LINK } from './fb2-render.js';
import { PAGE } from './fb2-layout.js';

function fakeCtx() {
  const calls = [];
  return new Proxy({ calls }, {
    get: (t, k) => (k === 'calls' ? calls : (...a) => calls.push([k, ...a])),
    set: (t, k, v) => { calls.push(['set', k, v]); return true; },
  });
}
const page = { items: [
  { k: 'line', base: 100, size: 18, segs: [{ s: 'Привет', x: 50, w: 54, font: 'bold 18px x', dy: 0 }, { s: '[1]', x: 110, w: 20, font: '12px x', dy: -6, link: true }] },
  { k: 'line', base: 130, size: 18, segs: [{ s: 'зачёркнуто', x: 50, w: 90, font: '18px x', dy: 0, strike: true }] },
  { k: 'img', id: 'a', x: 20, y: 200, w: 100, h: 50 },
] };

test('paints the paper first, over the whole page', () => {
  const c = fakeCtx();
  drawPage(c, page, new Map());
  assert.deepEqual(c.calls.slice(0, 2), [['set', 'fillStyle', PAPER], ['fillRect', 0, 0, PAGE.w, PAGE.h]]);
});
test('draws every segment with its font at base + shift; links get the link colour', () => {
  const c = fakeCtx();
  drawPage(c, page, new Map());
  const texts = c.calls.filter((x) => x[0] === 'fillText');
  assert.deepEqual(texts.map((t) => t.slice(1)), [['Привет', 50, 100], ['[1]', 110, 94], ['зачёркнуто', 50, 130]]);
  assert.ok(c.calls.some((x) => x[0] === 'set' && x[1] === 'font' && x[2] === 'bold 18px x'));
  const fills = c.calls.filter((x) => x[0] === 'set' && x[1] === 'fillStyle').map((x) => x[2]);
  assert.ok(fills.includes(LINK) && fills.includes(INK));
});
test('strikethrough adds a thin rule', () => {
  const c = fakeCtx();
  drawPage(c, page, new Map());
  assert.equal(c.calls.filter((x) => x[0] === 'fillRect').length, 2);
});
test('images are drawn when decoded and silently skipped when not', () => {
  const withImg = fakeCtx();
  const bmp = { id: 'bitmap' };
  drawPage(withImg, page, new Map([['a', bmp]]));
  assert.deepEqual(withImg.calls.find((x) => x[0] === 'drawImage'), ['drawImage', bmp, 20, 200, 100, 50]);
  const without = fakeCtx();
  drawPage(without, page, new Map());
  assert.ok(!without.calls.some((x) => x[0] === 'drawImage'));
});
