// Atomicity: every source file states its single responsibility in the first line.
import fs from 'node:fs';
import { files } from './_walk.mjs';
const SETS = [['www/js', ['.js'], /^\/\/ \S/], ['www/css', ['.css'], /^\/\* \S/], ['src-tauri/src', ['.rs'], /^\/\/[/!]? \S/]];
export default function run() {
  const out = [];
  for (const [dir, exts, re] of SETS) {
    for (const f of files(dir, exts)) {
      if (!re.test(fs.readFileSync(f, 'utf8'))) out.push(`${f}: first line must state the file's responsibility`);
    }
  }
  return out;
}
