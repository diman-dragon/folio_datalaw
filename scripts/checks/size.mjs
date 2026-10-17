// Atomicity: one file = one responsibility => a file must stay small.
import fs from 'node:fs';
import { files } from './_walk.mjs';
const SETS = [['www/js', ['.js'], 110], ['www/css', ['.css'], 70], ['scripts', ['.mjs'], 70], ['src-tauri/src', ['.rs'], 120]];
export default function run() {
  const out = [];
  for (const [dir, exts, max] of SETS) {
    for (const f of files(dir, exts)) {
      const n = fs.readFileSync(f, 'utf8').split('\n').length;
      if (n > max) out.push(`${f}: ${n} lines > ${max} - split by responsibility`);
    }
  }
  return out;
}
