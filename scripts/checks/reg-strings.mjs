// Registry: core/strings.js is the list of texts - every t('key') exists and every key is used (dynamic prefixes count).
import { read, logicJs } from './_registry.mjs';
export default function run() {
  const have = new Set([...read('www/js/core/strings.js').matchAll(/^\s*'([\w.]+)':/gm)].map((m) => m[1]));
  const used = new Set(), prefixes = [], out = [];
  for (const f of logicJs()) {
    const src = read(f);
    for (const m of src.matchAll(/\bt\(\s*'([\w.]+)'/g)) used.add(m[1]);
    for (const m of src.matchAll(/\bt\(\s*[^'()`]*\?\s*'([\w.]+)'\s*:\s*'([\w.]+)'/g)) { used.add(m[1]); used.add(m[2]); }
    for (const m of src.matchAll(/\bt\(`([\w.]+)\$\{/g)) prefixes.push(m[1]);
  }
  for (const k of used) if (!have.has(k)) out.push(`t('${k}') has no text in core/strings.js`);
  for (const k of have) if (!used.has(k) && !prefixes.some((p) => k.startsWith(p))) out.push(`core/strings.js: key "${k}" is never used - remove it`);
  return out;
}
