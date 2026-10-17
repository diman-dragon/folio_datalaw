// Shared helper (runner skips "_" files): lists project source files by extension.
import fs from 'node:fs';
import path from 'node:path';
export function files(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return ['vendor', 'target', 'gen'].includes(e.name) ? [] : files(p, exts);
    return exts.includes(path.extname(e.name)) ? [p] : [];
  });
}
export const norm = (p) => p.replaceAll('\\', '/');
