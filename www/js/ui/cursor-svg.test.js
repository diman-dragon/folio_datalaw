// Tests for the tool cursors: every tool has one, colours are embedded and sanitised, hotspots are inside the image.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cursorFor, cursorCss } from './cursor-svg.js';

const TOOLS = ['pen', 'highlighter', 'eraser', 'text-select', 'underline'];
const decode = (c) => decodeURIComponent(c.url.replace('data:image/svg+xml,', ''));

test('every editing tool has a cursor with a hotspot inside the 32x32 image', () => {
  for (const t of TOOLS) {
    const c = cursorFor(t, '#ef4444');
    assert.ok(c.url.startsWith('data:image/svg+xml,'), t);
    assert.ok(c.x >= 0 && c.x <= 32 && c.y >= 0 && c.y <= 32, `${t} hotspot`);
    assert.ok(c.url.length < 4000, `${t} stays small`);
  }
});
test('pen, marker and text tools show the current colour; the eraser does not', () => {
  for (const t of ['pen', 'highlighter', 'text-select', 'underline']) assert.ok(decode(cursorFor(t, '#ef4444')).includes('#ef4444'), t);
  assert.ok(!decode(cursorFor('eraser', '#ef4444')).includes('#ef4444'));
});
test('the colour changes the image', () => {
  assert.notEqual(cursorFor('pen', '#ef4444').url, cursorFor('pen', '#10b981').url);
});
test('a malformed colour cannot inject markup: it falls back to the default', () => {
  const svg = decode(cursorFor('pen', '"/><script>x</script>'));
  assert.ok(!svg.includes('<script') && svg.includes('#2563eb'));
});
test('unknown tools and "no tool" have no cursor', () => {
  assert.equal(cursorFor('hand', '#fff'), null);
  assert.equal(cursorCss(null, '#fff'), null);
});
test('the CSS value is url + hotspot + a crosshair fallback', () => {
  assert.match(cursorCss('pen', '#2563eb'), /^url\("data:image\/svg\+xml,[^"]+"\) 3 29, crosshair$/);
});
