// FB2 (FictionBook XML) -> a flat list of blocks (titles, paragraphs, verses, images) + metadata + embedded images.
const ln = (el) => el.localName;
const kids = (el) => [...el.children];
const attr = (el, name) => [...el.attributes].find((a) => a.name === name || a.name.endsWith(`:${name}`))?.value ?? '';
const STYLE = { strong: 'b', emphasis: 'i', sup: 'sup', sub: 'sub', code: 'code', strikethrough: 'strike' };
export function runsOf(el, st = {}) {
  const out = [];
  for (const n of el.childNodes) {
    if (n.nodeType === 3) {
      const s = n.nodeValue.replace(/\s+/g, ' ');
      if (s) out.push({ s, ...st });
    } else if (n.nodeType === 1) {
      const name = ln(n);
      if (STYLE[name]) out.push(...runsOf(n, { ...st, [STYLE[name]]: true }));
      else if (name === 'a') out.push(...runsOf(n, attr(n, 'type') === 'note' ? { ...st, sup: true, link: true } : { ...st, link: true }));
      else if (name === 'style') out.push(...runsOf(n, st));
    }
  }
  return out;
}
export function trimRuns(runs) {
  const r = runs.map((x) => ({ ...x }));
  while (r.length && !r[0].s.trim()) r.shift();
  while (r.length && !r.at(-1).s.trim()) r.pop();
  if (r.length) { r[0].s = r[0].s.trimStart(); r.at(-1).s = r.at(-1).s.trimEnd(); }
  return r;
}
const textBlock = (t, runs, extra = {}) => { const r = trimRuns(runs); return r.length ? [{ t, runs: r, ...extra }] : []; };
const titleRuns = (el) => kids(el).filter((c) => ln(c) === 'p').flatMap((p, i) => (i ? [{ s: ' ' }] : []).concat(runsOf(p)));
function poem(el, out, ctx) {
  for (const c of kids(el)) {
    const name = ln(c);
    if (name === 'title') out.push(...textBlock('subtitle', titleRuns(c)));
    else if (name === 'epigraph') container(c, 1, out, ctx, { quote: true });
    else if (name === 'stanza') { kids(c).filter((v) => ln(v) === 'v').forEach((v) => out.push(...textBlock('verse', runsOf(v)))); out.push({ t: 'gap' }); }
    else if (name === 'text-author') out.push(...textBlock('author', runsOf(c)));
    else if (name === 'date') out.push(...textBlock('verse', runsOf(c), { i: true }));
  }
}
function table(el, out) {
  for (const tr of el.getElementsByTagName('tr')) {
    const cells = kids(tr).map((td) => trimRuns(runsOf(td)).map((r) => r.s).join(''));
    out.push(...textBlock('p', [{ s: cells.join(' | ') }], { indent: false }));
  }
}
function container(el, depth, out, ctx, mode = {}) {
  for (const c of kids(el)) {
    const name = ln(c);
    if (name === 'title') out.push(...textBlock('title', titleRuns(c), { level: Math.max(1, depth) }));
    else if (name === 'subtitle') out.push(...textBlock('subtitle', runsOf(c)));
    else if (name === 'p') {
      out.push(...textBlock('p', runsOf(c), mode.quote ? { quote: true } : {}));
      for (const im of c.getElementsByTagName('image')) ctx.image(im, out);
    } else if (name === 'empty-line') out.push({ t: 'empty' });
    else if (name === 'image') ctx.image(c, out);
    else if (name === 'epigraph' || name === 'cite' || name === 'annotation') container(c, depth, out, ctx, { quote: true });
    else if (name === 'text-author') out.push(...textBlock('author', runsOf(c)));
    else if (name === 'poem') poem(c, out, ctx);
    else if (name === 'table') table(c, out);
    else if (name === 'section') container(c, depth + 1, out, ctx, mode.quote ? mode : {});
  }
}
const nameOf = (a) => ['first-name', 'middle-name', 'last-name'].map((k) => a.getElementsByTagName(k)[0]?.textContent.trim()).filter(Boolean).join(' ')
  || a.getElementsByTagName('nickname')[0]?.textContent.trim() || '';
export function parseFb2(xml, parseXml) {
  const doc = parseXml(xml);
  const root = doc.documentElement;
  if (!root || ln(root) !== 'FictionBook' || doc.getElementsByTagName('parsererror').length) throw new Error('not an FB2 file');
  const info = root.getElementsByTagName('title-info')[0];
  const title = info?.getElementsByTagName('book-title')[0]?.textContent.trim() || '';
  const author = info ? [...info.getElementsByTagName('author')].map(nameOf).filter(Boolean).join(', ') : '';
  const ids = [];
  const ctx = { image(im, out) { const id = attr(im, 'href').replace(/^#/, ''); if (id) { ids.push(id); out.push({ t: 'image', id }); } } };
  const blocks = [];
  if (author) blocks.push({ t: 'cover-author', runs: [{ s: author }] });
  blocks.push({ t: 'cover-title', runs: [{ s: title || 'Без названия' }] });
  const ann = info?.getElementsByTagName('annotation')[0];
  if (ann) container(ann, 0, blocks, ctx, { quote: true });
  const bodies = kids(root).filter((b) => ln(b) === 'body');
  for (const b of bodies.filter((x) => attr(x, 'name') !== 'notes')) { blocks.push({ t: 'pagebreak' }); container(b, 0, blocks, ctx); }
  for (const b of bodies.filter((x) => attr(x, 'name') === 'notes')) {
    blocks.push({ t: 'pagebreak' }, { t: 'title', level: 1, runs: [{ s: 'Примечания' }] });
    container(b, 1, blocks, ctx);
  }
  const binaries = new Map([...root.getElementsByTagName('binary')].map((b) => [attr(b, 'id'), { type: attr(b, 'content-type') || 'image/jpeg', b64: b.textContent.replace(/\s+/g, '') }]));
  return { title, author, blocks, binaries, imageIds: [...new Set(ids)] };
}
