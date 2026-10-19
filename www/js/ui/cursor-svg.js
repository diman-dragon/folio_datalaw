// Mouse cursors of the editing tools as 32x32 SVGs; pen, marker and text tools show the current colour.
const FALLBACK = '#2563eb';
const HEX = /^#[0-9a-f]{3,8}$/i;
const INK = '#111';
// shapes are drawn twice: a white halo first (readable on dark pages), then the real fill with a thin dark outline
const poly = (pts, fill) => ({ pts, fill });
const draw = (polys) => polys.map((p) => `<polygon points="${p.pts}" fill="#fff" stroke="#fff" stroke-width="3.6" stroke-linejoin="round"/>`).join('')
  + polys.map((p) => `<polygon points="${p.pts}" fill="${p.fill}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`).join('');
const ibeam = (extra = '') => `<path d="M11 5h10M16 5v22M11 27h10" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round"/>`
  + `<path d="M11 5h10M16 5v22M11 27h10" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>${extra}`;
const TOOLS = {
  pen: { hot: [3, 29], svg: (c) => draw([poly('3,29 6.5,20.5 11.5,25.5', '#e8c9a0'), poly('3,29 4.4,25.6 6.4,27.6', '#222'), poly('6.5,20.5 11.5,25.5 29,8 24,3', c), poly('24,3 29,8 31,6 26,1', '#f472b6')]) },
  highlighter: { hot: [3, 29], svg: (c) => draw([poly('3,29 6,20 12,26', c), poly('6,20 12,26 30,8 24,2', '#9ca3af'), poly('24,2 30,8 31.5,6.5 25.5,0.5', '#4b5563')]) },
  eraser: { hot: [6, 26], svg: () => draw([poly('3,22 10,29 15,24 8,17', '#f472b6'), poly('8,17 15,24 28,11 21,4', '#f3f4f6')]) },
  'text-select': { hot: [16, 16], svg: (c) => ibeam(`<rect x="19" y="18" width="11" height="9" rx="1.5" fill="${c}" stroke="${INK}" stroke-width="1.1"/>`) },
  underline: { hot: [16, 14], svg: (c) => ibeam(`<path d="M8 30.5h17" stroke="#fff" stroke-width="4.6" stroke-linecap="round"/><path d="M8 30.5h17" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`) },
};
export function cursorFor(tool, color) {
  const def = TOOLS[tool];
  if (!def) return null;
  const c = HEX.test(color) ? color : FALLBACK;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${def.svg(c)}</svg>`;
  return { url: `data:image/svg+xml,${encodeURIComponent(svg)}`, x: def.hot[0], y: def.hot[1] };
}
// Value for the CSS `cursor` property, or null when the tool has no cursor.
export function cursorCss(tool, color) {
  const c = cursorFor(tool, color);
  return c ? `url("${c.url}") ${c.x} ${c.y}, crosshair` : null;
}
