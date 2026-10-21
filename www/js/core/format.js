// Pure helpers: file names, sizes and reading progress.
export const fileName = (p) => p.split(/[\\/]/).pop() || p;
export const stripExt = (n) => n.replace(/\.[^.]+$/, '');
// Document kind by file name: 'pdf', 'fb2' (also .fb2.zip) or null.
export const docKind = (p) => { const n = p.toLowerCase(); return n.endsWith('.fb2.zip') || n.endsWith('.fb2') ? 'fb2' : n.endsWith('.pdf') ? 'pdf' : null; };
export const isDocPath = (p) => docKind(p) !== null;
export const stripDocExt = (n) => n.replace(/\.(fb2\.zip|fb2|pdf)$/i, '');
export function fmtSize(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}
export const progress = (page, pages) => (pages > 0 ? Math.min(100, Math.round(((page ?? 1) / pages) * 100)) : 0);
