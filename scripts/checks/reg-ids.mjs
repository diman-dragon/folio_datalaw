// Registry: every id in index.html belongs to exactly one component and every declared id exists.
import { readJson, read } from './_registry.mjs';
export default function run() {
  const html = new Set([...read('www/index.html').matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const owner = {}, out = [];
  for (const [k, c] of Object.entries(readJson('components'))) {
    for (const id of c.ids ?? []) {
      if (owner[id]) out.push(`id "${id}" is declared by both ${owner[id]} and ${k}`);
      owner[id] = k;
      if (!html.has(id)) out.push(`${k}: declared id "${id}" is not in index.html`);
    }
  }
  for (const id of html) if (!owner[id]) out.push(`index.html: id "${id}" belongs to no component - add it to "ids" of its component`);
  return out;
}
