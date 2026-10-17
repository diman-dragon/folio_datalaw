// Every icon used in index.html or icon('name') must exist in www/img/icons.svg.
import fs from 'node:fs';
import { files } from './_walk.mjs';
export default function run() {
  const svg = fs.readFileSync('www/img/icons.svg', 'utf8');
  const have = new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const used = [];
  const html = fs.readFileSync('www/index.html', 'utf8');
  for (const m of html.matchAll(/icons\.svg#([\w-]+)/g)) used.push(['index.html', m[1]]);
  for (const f of files('www/js', ['.js'])) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/icon\(\s*'([\w-]+)'/g)) used.push([f, m[1]]);
  }
  return used.filter(([, n]) => !have.has(n)).map(([f, n]) => `${f}: icon "${n}" is not in icons.svg`);
}
