// Shared helper for registry checks (runner skips "_" files): loads registry/*.json, lists source files, maps a file to its component.
import fs from 'node:fs';
import path from 'node:path';
import { files, norm } from './_walk.mjs';
export const readJson = (name) => JSON.parse(fs.readFileSync(`registry/${name}.json`, 'utf8'));
export const read = (f) => fs.readFileSync(f, 'utf8');
const SRC = [['www/js', ['.js']], ['www/css', ['.css']], ['src-tauri/src', ['.rs']], ['scripts', ['.mjs']]];
export const sourceFiles = () => SRC.flatMap(([dir, exts]) => files(dir, exts)).map(norm);
export const isTest = (f) => f.endsWith('.test.js') || f.endsWith('_tests.rs');
export const logicJs = () => sourceFiles().filter((f) => f.startsWith('www/js/') && !isTest(f) && !f.startsWith('www/js/scenarios/'));
const rx = (p) => new RegExp('^' + p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$');
const baseOf = (f) => f.replace(/\.test\.js$/, '.js').replace(/_tests\.rs$/, '.rs');
export const owns = (pattern, f) => rx(pattern).test(f) || rx(pattern).test(baseOf(f));
export function ownersOf(f, comps = readJson('components')) {
  return Object.entries(comps).filter(([, c]) => c.files.some((p) => owns(p, f))).map(([k]) => k);
}
// Relative imports of a www/js file as repo-relative paths.
export function importsOf(f) {
  const out = [];
  for (const m of read(f).matchAll(/(?:from|import)\s+['"](\.[^'"]+)['"]/g)) out.push(norm(path.normalize(path.join(path.dirname(f), m[1]))));
  return out;
}
