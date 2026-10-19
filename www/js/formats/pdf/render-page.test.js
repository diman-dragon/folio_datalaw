// Tests for renderPage: render scale follows the device ratio, capped by DPR and by pixel count.
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage } from './render-page.js';

const page = () => {
  const calls = [];
  return { calls, getViewport: ({ scale }) => ({ width: 500 * scale, height: 700 * scale }), render: (o) => { calls.push(o); return { promise: Promise.resolve() }; } };
};
const canvas = () => ({ width: 0, height: 0, style: {} });
const withDpr = (v) => { globalThis.window = { devicePixelRatio: v }; };

test('canvas gets device resolution; css size stays 100% of its slot', () => {
  withDpr(2);
  const p = page(), c = canvas();
  renderPage(p, c, 1);
  assert.equal(c.width, 1000);
  assert.equal(c.height, 1400);
  assert.match(c.style.cssText, /width:100%/);
});
test('the device ratio is capped by dprMax', () => {
  withDpr(3);
  const c = canvas();
  renderPage(page(), c, 1, 1);
  assert.equal(c.width, 500);
});
test('huge pages are scaled down to the pixel budget', () => {
  withDpr(2);
  const c = canvas();
  renderPage(page(), c, 5); // 2500x3500 css px would be 35 MP at DPR 2
  assert.ok(c.width * c.height <= 8e6 * 1.01);
});
test('the viewport passed to pdf.js matches the canvas', () => {
  withDpr(1);
  const p = page(), c = canvas();
  renderPage(p, c, 2);
  assert.equal(p.calls[0].canvas, c);
  assert.equal(p.calls[0].viewport.width, c.width);
});
