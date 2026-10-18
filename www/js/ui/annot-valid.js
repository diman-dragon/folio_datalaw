// Validation of annotation items loaded from storage (untrusted input): kind, colour, numbers.
const KINDS = new Set(['pen', 'hl', 'th', 'tu']);
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const point = (p) => Array.isArray(p) && num(p[0]) && num(p[1]);
const rect = (r) => Array.isArray(r) && r.length === 4 && r.every(num);
export function validItem(it) {
  if (!it || !KINDS.has(it.k) || typeof it.c !== 'string' || !/^#[0-9a-f]{3,8}$/i.test(it.c)) return false;
  if (it.k === 'pen' || it.k === 'hl') return num(it.w) && Array.isArray(it.p) && it.p.length > 0 && it.p.every(point);
  return Array.isArray(it.r) && it.r.length > 0 && it.r.every(rect);
}
