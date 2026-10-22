// Registry: storage.json lists every persisted key with owner and files; per-document data is dropped when an entry is removed.
import fs from 'node:fs';
import { readJson, read, logicJs, ownersOf } from './_registry.mjs';
const USES = /\bstore\.(?:get|set|del)\(|\b(?:getPref|setPref)\(/;
export default function run() {
  const reg = readJson('storage'), comps = readJson('components'), listed = new Set(), out = [];
  const removal = read('www/js/app/remove-entry.js');
  for (const [key, e] of Object.entries(reg)) {
    if (!comps[e.owner]) out.push(`${key}: unknown owner "${e.owner}"`);
    const present = e.files.filter((f) => fs.existsSync(f));
    e.files.forEach((f) => { listed.add(f); if (!present.includes(f)) out.push(`${key}: ${f} does not exist`); });
    if (!present.some((f) => read(f).includes(e.needle))) out.push(`${key}: no listed file contains ${e.needle} any more`);
    if (e.perDocument && !removal.includes(`${e.dropper}(`)) out.push(`${key}: per-document data must be dropped in app/remove-entry.js with ${e.dropper}()`);
  }
  for (const f of logicJs()) {
    if (ownersOf(f, comps)[0] !== 'storage' && USES.test(read(f)) && !listed.has(f)) out.push(`${f}: uses persistent storage, but no key in registry/storage.json lists this file`);
  }
  return out;
}
