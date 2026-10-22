// Registry: components.json is well-formed and every source file belongs to exactly one component.
import { readJson, sourceFiles, ownersOf, owns } from './_registry.mjs';
const FIELDS = ['kind', 'about', 'files', 'ids', 'icons', 'uses'];
export default function run() {
  const comps = readJson('components'), kinds = readJson('kinds'), all = sourceFiles(), out = [];
  for (const [k, v] of Object.entries(kinds)) for (const m of v.may) if (!kinds[m]) out.push(`kinds.json: "${k}" may use unknown kind "${m}"`);
  for (const [k, c] of Object.entries(comps)) {
    if (!/^[a-z][a-z0-9-]*$/.test(k)) out.push(`components.json: key "${k}" must be kebab-case`);
    for (const f of FIELDS) if (c[f] == null) out.push(`components.json: "${k}" has no "${f}"`);
    if (!kinds[c.kind]) out.push(`components.json: "${k}" has unknown kind "${c.kind}"`);
    if (!String(c.about ?? '').trim()) out.push(`components.json: "${k}" has an empty "about"`);
    for (const u of c.uses ?? []) if (!comps[u]) out.push(`components.json: "${k}" uses unknown component "${u}"`);
    for (const p of c.files ?? []) if (!all.some((f) => owns(p, f))) out.push(`components.json: "${k}" file pattern ${p} matches no file`);
  }
  for (const f of all) {
    const o = ownersOf(f, comps);
    if (!o.length) out.push(`${f}: no component owns this file - add it to "files" of a component in registry/components.json`);
    if (o.length > 1) out.push(`${f}: owned by several components (${o.join(', ')})`);
  }
  return out;
}
