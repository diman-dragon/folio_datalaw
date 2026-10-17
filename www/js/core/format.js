// Pure helpers: file names, sizes and reading progress.
export const fileName = (p) => p.split(/[\\/]/).pop() || p;
export const stripExt = (n) => n.replace(/\.[^.]+$/, '');
export const isPdfPath = (p) => /\.pdf$/i.test(p);
export function fmtSize(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}
export const progress = (page, pages) => (pages > 0 ? Math.min(100, Math.round(((page ?? 1) / pages) * 100)) : 0);
