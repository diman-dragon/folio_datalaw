// Tests for the theme state (document and localStorage are faked).
import test from 'node:test';
import assert from 'node:assert/strict';
const mem = new Map();
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
globalThis.document = { documentElement: { dataset: {} } };
const { getTheme, setTheme, applyTheme } = await import('./theme.js');

test('defaults to light when the system has no dark preference', () => {
  assert.equal(getTheme(), 'light');
});
test('setTheme applies it to <html>, stores it and announces it', () => {
  setTheme('dark');
  assert.equal(document.documentElement.dataset.theme, 'dark');
  assert.equal(mem.get('folio.theme'), 'dark');
  assert.equal(getTheme(), 'dark');
});
test('applyTheme re-applies the current theme', () => {
  document.documentElement.dataset.theme = 'x';
  applyTheme();
  assert.equal(document.documentElement.dataset.theme, 'dark');
});
