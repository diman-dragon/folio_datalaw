// Small typed preferences (JSON values) on top of storage.
import { store } from './storage.js';
export function getPref(key, fallback) {
  const v = store.get('pref.' + key);
  if (v == null) return fallback;
  try { return JSON.parse(v); } catch { return fallback; }
}
export const setPref = (key, value) => store.set('pref.' + key, JSON.stringify(value));
