// Registry: events.json lists every bus / DOM / Tauri event with exactly the files that emit and listen to it.
import { readJson, read, logicJs } from './_registry.mjs';
export default function run() {
  const reg = readJson('events'), out = [], found = {};
  const dom = Object.entries(reg).filter(([, e]) => e.kind === 'dom').map(([n]) => n);
  const scans = [['emit', /\bemit\(\s*'([^']+)'/g], ['emit', /new CustomEvent\(\s*'([^']+)'/g], ['on', /(?<![.\w])on\(\s*'([^']+)'/g], ['on', /\blisten\(\s*'(tauri:[^']+)'/g]];
  if (dom.length) scans.push(['on', new RegExp(`addEventListener\\(\\s*'(${dom.join('|')})'`, 'g')]);
  for (const f of logicJs()) {
    for (const [role, re] of scans) for (const m of read(f).matchAll(re)) (found[m[1]] ??= { emit: new Set(), on: new Set() })[role].add(f);
  }
  for (const name of new Set([...Object.keys(found), ...Object.keys(reg)])) {
    if (!reg[name]) { out.push(`event "${name}" is used, but is not in registry/events.json`); continue; }
    for (const role of ['emit', 'on']) {
      const have = found[name]?.[role] ?? new Set(), want = new Set(reg[name][role]), verb = role === 'emit' ? 'emits' : 'listens to';
      for (const f of have) if (!want.has(f)) out.push(`event "${name}": ${f} ${verb} it, but "${role}" does not list the file`);
      for (const f of want) if (!have.has(f)) out.push(`event "${name}": "${role}" lists ${f}, but it no longer ${verb} the event`);
    }
  }
  return out;
}
