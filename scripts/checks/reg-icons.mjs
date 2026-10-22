// Registry: the icons components declare are exactly the icons used in index.html and through icon('name').
import { readJson, read, logicJs } from './_registry.mjs';
export default function run() {
  const declared = new Set(Object.values(readJson('components')).flatMap((c) => c.icons ?? []));
  const used = new Set([...read('www/index.html').matchAll(/icons\.svg#([\w-]+)/g)].map((m) => m[1]));
  for (const f of logicJs()) for (const m of read(f).matchAll(/icon\(\s*'([\w-]+)'/g)) used.add(m[1]);
  return [
    ...[...used].filter((i) => !declared.has(i)).map((i) => `icon "${i}" is used, but no component lists it in "icons"`),
    ...[...declared].filter((i) => !used.has(i)).map((i) => `icon "${i}" is listed in "icons", but is not used`),
  ];
}
