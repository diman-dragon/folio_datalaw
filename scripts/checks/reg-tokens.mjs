// Registry: theme.css defines the same tokens in both themes, tokens.json lists them, and CSS uses only known variables.
import { readJson, read, sourceFiles } from './_registry.mjs';
const names = (s) => new Set([...(s ?? '').matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
export default function run() {
  const reg = readJson('tokens'), out = [], listed = new Set(reg.theme);
  const [light, dark] = read('www/css/theme.css').split(/:root\[data-theme="dark"\]/);
  const L = names(light), D = names(dark);
  for (const n of L) if (!D.has(n)) out.push(`theme.css: ${n} is defined for light, but not for dark`);
  for (const n of D) if (!L.has(n)) out.push(`theme.css: ${n} is defined for dark, but not for light`);
  for (const n of L) if (!listed.has(n)) out.push(`theme.css: ${n} is not in registry/tokens.json "theme"`);
  for (const n of listed) if (!L.has(n)) out.push(`tokens.json: "${n}" is not defined in theme.css`);
  for (const [n, v] of Object.entries(reg.runtime)) if (!read(v.setBy).includes(n)) out.push(`tokens.json: ${v.setBy} does not set ${n}`);
  for (const f of sourceFiles().filter((x) => x.endsWith('.css'))) {
    for (const m of read(f).matchAll(/var\((--[\w-]+)/g)) if (!listed.has(m[1]) && !reg.runtime[m[1]]) out.push(`${f}: var(${m[1]}) is not a known token`);
  }
  return out;
}
