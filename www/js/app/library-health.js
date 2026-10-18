// Which library entries are readable right now: the file must still exist (checked in Rust) and have pages.
import { filesExist } from '../io/files-exist.js';
export async function splitReadable(docs) {
  if (!docs.length) return { ok: [], hidden: [] };
  let flags;
  try { flags = await filesExist(docs.map((d) => d.path)); } catch { flags = docs.map(() => true); } // no checker (plain browser): show all
  const ok = [], hidden = [];
  docs.forEach((d, i) => (flags[i] && d.pages > 0 ? ok : hidden).push(d));
  return { ok, hidden };
}
