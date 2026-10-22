// Registry: component dependencies ("uses") equal the real imports, obey the kind rules and have no cycles.
import { readJson, logicJs, importsOf, ownersOf } from './_registry.mjs';
export default function run() {
  const comps = readJson('components'), kinds = readJson('kinds'), out = [], real = {};
  for (const f of logicJs()) {
    const [a] = ownersOf(f, comps);
    for (const t of importsOf(f)) {
      const [b] = ownersOf(t, comps);
      if (a && b && a !== b) (real[a] ??= new Set()).add(b);
    }
  }
  for (const [k, c] of Object.entries(comps)) {
    const have = new Set(c.uses ?? []), want = real[k] ?? new Set();
    for (const u of want) if (!have.has(u)) out.push(`${k}: imports ${u}, but "uses" does not list it - add it to registry/components.json`);
    for (const u of have) if (!want.has(u)) out.push(`${k}: "uses" lists ${u}, but nothing imports it any more - remove it`);
    for (const u of have) if (comps[u] && !kinds[c.kind]?.may.includes(comps[u].kind)) out.push(`${k} (${c.kind}) must not use ${u} (${comps[u].kind}) - see registry/kinds.json`);
  }
  const state = {}, path = [];
  const visit = (n) => {
    state[n] = 1;
    path.push(n);
    for (const m of comps[n].uses ?? []) {
      if (state[m] === 1) out.push(`dependency cycle: ${[...path.slice(path.indexOf(m)), m].join(' -> ')}`);
      else if (!state[m] && comps[m]) visit(m);
    }
    path.pop();
    state[n] = 2;
  };
  Object.keys(comps).forEach((n) => { if (!state[n]) visit(n); });
  return out;
}
