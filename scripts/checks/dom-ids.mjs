// Every element id that JS looks up ($('x') / getElementById('x')) must exist in www/index.html.
import fs from 'node:fs';
import { files } from './_walk.mjs';
export default function run() {
  const html = fs.readFileSync('www/index.html', 'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const out = [];
  for (const f of files('www/js', ['.js'])) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/(?:getElementById|\$)\(\s*'([^']+)'\s*\)/g)) {
      if (!ids.has(m[1])) out.push(`${f}: id "${m[1]}" is not in index.html`);
    }
  }
  return out;
}
