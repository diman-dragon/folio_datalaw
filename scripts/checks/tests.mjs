// Every logic file needs a sibling *.test.js; exceptions live in tests-exempt.json and must carry a reason.
import fs from 'node:fs';
import { files, norm } from './_walk.mjs';
const EXEMPT = JSON.parse(fs.readFileSync(new URL('./tests-exempt.json', import.meta.url), 'utf8'));
const match = (f) => Object.keys(EXEMPT).find((k) => (k.endsWith('/') ? f.startsWith(k) : f === k));
export default function run() {
  const out = [];
  const all = files('www/js', ['.js']).map(norm);
  const logic = all.filter((f) => !f.endsWith('.test.js'));
  const used = new Set();
  for (const f of logic) {
    const rule = match(f);
    if (rule) used.add(rule);
    const tested = fs.existsSync(f.replace(/\.js$/, '.test.js'));
    if (!tested && !rule) out.push(`${f}: no ${f.replace(/^.*\//, '').replace('.js', '.test.js')} next to it (add a test, or an exemption with a reason)`);
    if (tested && rule && !rule.endsWith('/')) out.push(`${f}: has a test now, remove it from tests-exempt.json`);
  }
  for (const [k, reason] of Object.entries(EXEMPT)) {
    if (!String(reason).trim()) out.push(`tests-exempt.json: "${k}" has no reason`);
    if (!used.has(k)) out.push(`tests-exempt.json: "${k}" matches no file any more`);
  }
  if (all.filter((f) => f.includes('/scenarios/') && f.endsWith('.test.js')).length < 4) out.push('www/js/scenarios: expected at least 4 scenario tests');
  return out;
}
