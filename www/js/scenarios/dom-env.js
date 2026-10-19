// Test helper: a jsdom copy of index.html with the browser APIs the viewer needs. Import it BEFORE any app module.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8').replace(/<script[^>]*><\/script>/, '');
const { window } = new JSDOM(html, { pretendToBeVisual: true });
export const mem = new Map();
export const observers = [];
let clip = null;
Object.assign(globalThis, {
  window, document: window.document, CustomEvent: window.CustomEvent, innerWidth: 1200,
  requestAnimationFrame: (f) => setTimeout(f, 0), cancelAnimationFrame: clearTimeout,
  localStorage: { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) },
  ResizeObserver: class { observe() {} disconnect() {} },
  IntersectionObserver: class {
    constructor(cb, o) { this.cb = cb; this.o = o; this.t = new Set(); observers.push(this); }
    observe(e) { this.t.add(e); }
    unobserve(e) { this.t.delete(e); }
    disconnect() { this.t.clear(); }
  },
});
const nav = { userAgent: 'Node.js', platform: 'linux', language: 'ru', hardwareConcurrency: 1, clipboard: { writeText: async (t) => { clip = t; } } };
Object.defineProperty(globalThis, 'navigator', { value: nav, configurable: true }); // pdf.js reads userAgent / platform
window.HTMLCanvasElement.prototype.getContext = () => ({ measureText: (s) => ({ width: s.length * 50 }), set font(v) {} });
export const $ = (id) => document.getElementById(id);
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const ok = (cond, msg) => assert.ok(cond, msg);
export const copied = () => clip;
// layout metrics jsdom does not compute: pages are 500x700 units, 28px apart; the viewer area is 1000x700
const P = window.HTMLElement.prototype;
const isPage = (el) => el.classList?.contains('pdf-page');
Object.defineProperty(P, 'offsetTop', { get() { const i = Number(this.dataset?.i); return isPage(this) ? i * (parseFloat(this.style.height || '0') + 28) : 0; } });
Object.defineProperty(P, 'offsetHeight', { get() { return parseFloat(this.style.height || '0'); } });
Object.defineProperty(P, 'offsetWidth', { get() { return parseFloat(this.style.width || '0'); } });
P.getBoundingClientRect = function () { return isPage(this) ? { left: 0, top: 0, width: 500, height: 700, right: 500, bottom: 700 } : { left: 0, top: 0, width: 1000, height: 700, right: 1000, bottom: 700 }; };
for (const [k, v] of [['clientWidth', 1000], ['clientHeight', 700], ['scrollHeight', 9000]]) Object.defineProperty($('viewer-scroll'), k, { value: v });
export const TEXT = 'Hello world, this is sample text';
export function fakePdf(numPages = 4) {
  const page = {
    getViewport: ({ scale }) => ({ scale, width: 500 * scale, height: 700 * scale, transform: [scale, 0, 0, -scale, 0, 700 * scale] }),
    render: () => ({ promise: wait(3), cancel() {} }),
    getTextContent: async () => ({ items: [{ str: TEXT, transform: [12, 0, 0, 12, 50, 600], width: 300 }], styles: {} }),
  };
  return { numPages, getPage: async () => page, loadingTask: { destroy: async () => {} } };
}
// Pretends the browser reports these pages as visible, so the painter renders them.
export async function paint(indices = [0, 1]) {
  const io = observers.find((i) => i.o.root === $('viewer-scroll'));
  io.cb(indices.map((i) => ({ target: $('viewer-pages').children[i], isIntersecting: true })));
  await wait(100);
}
export function ptr(type, x, y, target = $('viewer-pages').children[0]) {
  const e = new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  Object.defineProperty(e, 'isPrimary', { value: true });
  target.dispatchEvent(e);
}
export const key = (k, o = {}) => document.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...o }));
export async function drag(points) {
  ptr('pointerdown', ...points[0]);
  for (const p of points.slice(1)) ptr('pointermove', ...p);
  await wait(30);
  ptr('pointerup', ...points.at(-1));
  await wait(40);
}
