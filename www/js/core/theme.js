// Theme state: light | dark. Persists and applies to <html data-theme>.
import { store } from './storage.js';
import { emit } from './bus.js';
const prefersDark = () => globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches;
let cur = store.get('theme') ?? (prefersDark() ? 'dark' : 'light');
export const getTheme = () => cur;
export function applyTheme() {
  document.documentElement.dataset.theme = cur;
  emit('themechange', cur);
}
export function setTheme(v) {
  cur = v;
  store.set('theme', v);
  applyTheme();
}
