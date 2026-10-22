// Accessibility of the static markup: icon-only buttons and inputs need a name (aria-label), toolbars need a label.
import fs from 'node:fs';
export default function run() {
  const html = fs.readFileSync('www/index.html', 'utf8');
  const out = [];
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const text = m[2].replace(/<[^>]*>/g, '').trim();
    if (!text && !/aria-label="[^"]+"/.test(m[1])) out.push(`button without text or aria-label: ${m[1].trim().slice(0, 70)}`);
  }
  for (const m of html.matchAll(/<input\b([^>]*)>/g)) {
    if (!/aria-label="[^"]+"/.test(m[1])) out.push(`input without aria-label: ${m[1].trim().slice(0, 70)}`);
  }
  for (const m of html.matchAll(/<header\b([^>]*role="toolbar"[^>]*)>/g)) {
    if (!/aria-label="[^"]+"/.test(m[1])) out.push('toolbar without aria-label');
  }
  return out;
}
