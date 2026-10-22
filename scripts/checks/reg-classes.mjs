// Registry: every public CSS class a component declares ("classes") is defined in a stylesheet.
import { readJson, read, sourceFiles } from './_registry.mjs';
export default function run() {
  const css = sourceFiles().filter((f) => f.endsWith('.css')).map(read).join('\n'), out = [];
  for (const [k, c] of Object.entries(readJson('components'))) {
    for (const n of c.classes ?? []) if (!new RegExp(`\\.${n}(?![\\w-])`).test(css)) out.push(`${k}: public class ".${n}" is not defined in any CSS file`);
  }
  return out;
}
