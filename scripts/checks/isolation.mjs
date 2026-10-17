// Tauri isolation: only www/js/io/bridge.js may touch window.__TAURI__ (keeps the viewer portable).
import fs from 'node:fs';
import { files, norm } from './_walk.mjs';
export default function run() {
  const out = [];
  for (const f of files('www/js', ['.js'])) {
    if (norm(f) === 'www/js/io/bridge.js' || f.endsWith('.test.js')) continue;
    if (fs.readFileSync(f, 'utf8').includes('__TAURI__')) out.push(`${f}: __TAURI__ is allowed only in io/bridge.js`);
  }
  return out;
}
