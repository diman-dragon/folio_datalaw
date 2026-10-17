// Raises the last digit (0.0.1 -> 0.0.2) in package.json, tauri.conf.json and Cargo.toml.
import fs from 'node:fs';
const read = (f) => fs.readFileSync(f, 'utf8');
const pkg = JSON.parse(read('package.json'));
const next = pkg.version.replace(/\d+$/, (n) => String(Number(n) + 1));
const json = (f) => fs.writeFileSync(f, read(f).replace(/"version":\s*"[^"]+"/, `"version": "${next}"`));
json('package.json');
json('src-tauri/tauri.conf.json');
const cargo = 'src-tauri/Cargo.toml';
fs.writeFileSync(cargo, read(cargo).replace(/^version\s*=\s*"[^"]+"/m, `version = "${next}"`));
console.log(`${pkg.version} -> ${next}. Add an entry at the top of CHANGELOG.md.`);
