// Registry: every shortcut in shortcuts.json points at a file that really handles it; one action per key in a scope.
import fs from 'node:fs';
import { readJson, read } from './_registry.mjs';
export default function run() {
  const out = [], seen = new Set();
  for (const s of readJson('shortcuts')) {
    const id = `${s.scope}: ${s.keys}`;
    if (seen.has(id)) out.push(`shortcuts.json: duplicate "${id}"`);
    seen.add(id);
    if (!fs.existsSync(s.file)) out.push(`${id}: ${s.file} does not exist`);
    else if (!read(s.file).includes(s.needle)) out.push(`${id}: ${s.file} no longer contains ${s.needle}`);
  }
  return out;
}
