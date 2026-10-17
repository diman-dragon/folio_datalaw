// One version everywhere: package.json, tauri.conf.json and Cargo.toml must agree.
import fs from 'node:fs';
export default function run() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  const tauri = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8')).version;
  const cargo = /^version\s*=\s*"([^"]+)"/m.exec(fs.readFileSync('src-tauri/Cargo.toml', 'utf8'))?.[1];
  return pkg === tauri && pkg === cargo ? [] : [`version mismatch: package ${pkg}, tauri ${tauri}, cargo ${cargo}`];
}
