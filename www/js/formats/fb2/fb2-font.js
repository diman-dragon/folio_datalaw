// Font strings for FB2 text styles (one place, so measuring while laying out and drawing always agree).
export const FAMILY = "Georgia, 'Times New Roman', serif";
export const MONO = "Consolas, 'Courier New', monospace";
// st: { b, i, sup, sub, code } -> CSS font shorthand
export function fontOf(st, size) {
  const px = st.sup || st.sub ? Math.round(size * 0.7 * 10) / 10 : size;
  return `${st.i ? 'italic ' : ''}${st.b ? 'bold ' : ''}${px}px ${st.code ? MONO : FAMILY}`;
}
// vertical shift of the baseline for superscript / subscript runs
export const shiftOf = (st, size) => (st.sup ? -size * 0.35 : st.sub ? size * 0.2 : 0);
