// Registry: commands.json matches the Rust command files, the handler list in lib.rs, the JS wrappers and the Tauri permissions.
import fs from 'node:fs';
import { readJson, read, logicJs } from './_registry.mjs';
export default function run() {
  const { commands, permissions } = readJson('commands'), out = [];
  const lib = read('src-tauri/src/lib.rs'), mod = read('src-tauri/src/commands/mod.rs');
  const files = fs.readdirSync('src-tauri/src/commands').filter((n) => n.endsWith('.rs') && n !== 'mod.rs').map((n) => n.replace('.rs', ''));
  for (const n of files) if (!commands[n]) out.push(`commands/${n}.rs: command is not in registry/commands.json`);
  for (const [n, c] of Object.entries(commands)) {
    if (!fs.existsSync(c.rust) || !fs.existsSync(c.js)) { out.push(`${n}: ${c.rust} or ${c.js} does not exist`); continue; }
    if (!c.rust.endsWith(`/commands/${n}.rs`)) out.push(`${n}: one command = one file named after it (${n}.rs)`);
    if (!read(c.rust).includes(`fn ${n}(`)) out.push(`${n}: no "fn ${n}(" in ${c.rust}`);
    if (!read(c.rust).includes(`${c.guard}::`)) out.push(`${n}: ${c.rust} does not go through ${c.guard}`);
    if (!lib.includes(`commands::${n}::${n}`)) out.push(`${n}: not registered in lib.rs generate_handler!`);
    if (!mod.includes(`pub mod ${n};`)) out.push(`${n}: missing "pub mod ${n};" in commands/mod.rs`);
    if (!read(c.js).includes(`invoke('${n}'`)) out.push(`${n}: ${c.js} does not call invoke('${n}')`);
  }
  for (const f of logicJs()) for (const m of read(f).matchAll(/\binvoke\(\s*'([^']+)'/g)) if (!commands[m[1]]) out.push(`${f}: invoke('${m[1]}') is not in registry/commands.json`);
  const granted = JSON.parse(read('src-tauri/capabilities/default.json')).permissions;
  for (const p of permissions) if (!granted.includes(p)) out.push(`permission ${p} is in the registry, but not in capabilities/default.json`);
  for (const p of granted) if (!permissions.includes(p)) out.push(`permission ${p} is granted in capabilities/default.json, but not in the registry`);
  return out;
}
