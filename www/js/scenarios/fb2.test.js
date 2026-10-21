// Scenario: an FB2 book goes through the same flow as a PDF: library, viewer, text selection, marks, undo, drawing, OCR rules.
import test from 'node:test';
import fs from 'node:fs';
import { $, ok, wait, key, paint, drag, copied, mem } from './dom-env.js';
const BOOK = new URL('../../../test-fixtures/book.fb2', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const drawn = [];
// a canvas whose text metrics are fixed (9 px per char) and which records the text drawn
window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
  get: (t, k) => (k === 'measureText' ? (s) => ({ width: s.length * 9 }) : (...a) => { if (k === 'fillText') drawn.push(a[0]); }),
  set: () => true,
});
globalThis.DOMParser = window.DOMParser;
window.__TAURI__ = {
  core: { invoke: async (cmd, args) => {
    if (cmd === 'read_doc') return fs.readFileSync(args.path).buffer.slice(0);
    if (cmd === 'files_exist') return args.paths.map(() => true);
    throw new Error(`unexpected ${cmd}`);
  } },
  event: { listen: async () => {} },
  dialog: { open: async () => null },
};
await import('../main.js');
const { openPath } = await import('../app/open-path.js');
const { getDocByPath } = await import('../data/library.js');
const { getItems } = await import('../ui/annot-data.js');
const { getActive } = await import('../ui/active-doc.js');
const { textOf } = await import('../ui/sel-chars.js');
const { recognizePages } = await import('../app/ocr.js');
const C = $('viewer-pages');
const page = (i) => C.children[i];
const tool = (n) => document.querySelector(`.tp-btn[data-tool="${n}"]`).click();
// page 500x700 on screen vs 540x780 page units: convert a char box centre to pointer coordinates
const at = (c) => [(c.x + c.w / 2) * (500 / 540), (c.y + c.h / 2) * (700 / 780)];

await openPath(BOOK);
await wait(80);

test('the book is added to the library as FB2 with its title, and opens in the viewer', () => {
  const d = getDocByPath(BOOK);
  ok(d.kind === 'fb2' && d.pages >= 6, `kind ${d.kind}, pages ${d.pages}`);
  ok(d.title === 'Иван Тестов — Тестовая книга', d.title);
  ok(!$('viewer').hidden && $('viewer-title').textContent === d.title, 'viewer shows the title');
  ok($('page-total').textContent === `/ ${d.pages}`, 'page counter');
});
test('pages are painted: text is drawn and the page is marked ready', async () => {
  await paint([0, 1, 2]);
  ok(page(0).classList.contains('ready') && page(1).classList.contains('ready'), 'ready');
  ok(drawn.includes('Тестовая') && drawn.includes('книга'), 'the title page words were drawn');
  ok(drawn.length > 50, `text drawn: ${drawn.length} pieces`);
});
test('selecting text with the mouse and copying gives the book text', async () => {
  getActive().list.goTo(2);
  await paint([1]);
  const T = await getActive().text.getText(1);
  const [a, b] = [T.chars[0], T.chars[11]];
  await drag([at(a), at(b)], page(1));
  await wait(60);
  ok(page(1).querySelectorAll('.sel-box').length >= 1 && !$('text-menu').hidden, 'selection and menu on an FB2 page');
  key('c', { ctrlKey: true }); await wait(20);
  ok(copied() === textOf(T.chars, 0, 11) && copied().length > 5, `copied "${copied()}"`);
});
test('the menu highlights the selection; undo and redo work like in a PDF', async () => {
  document.querySelector('#text-menu [data-act="hl"]').click();
  ok(getItems(1).some((i) => i.k === 'th'), 'highlight stored');
  $('undo-btn').click(); ok(!getItems(1).some((i) => i.k === 'th'), 'undo');
  $('redo-btn').click(); ok(getItems(1).some((i) => i.k === 'th'), 'redo');
});
test('pen drawing works on an FB2 page and survives closing and reopening', async () => {
  $('edit-btn').click(); tool('pen');
  await drag([[100, 400], [200, 450], [300, 430]], page(1));
  ok(getItems(1).some((i) => i.k === 'pen'), 'stroke stored');
  await wait(800);
  ok(JSON.parse(mem.get(`folio.annot.${getDocByPath(BOOK).id}`))[1].length >= 2, 'saved');
  key('Escape'); key('Escape'); await wait(60);
  ok($('viewer').hidden, 'closed');
  await openPath(BOOK); await wait(80);
  await paint([1]);
  ok(getItems(1).length >= 2 && page(1).querySelectorAll('.annot path').length >= 2, 'annotations restored and painted');
});
test('OCR leaves pages that already have text alone (only image pages need it)', async () => {
  let calls = 0;
  const deps = { recognize: async () => { calls++; return []; }, render: async () => ({ canvas: { width: 100 }, w: 540, h: 780 }) };
  const done = await recognizePages(getActive(), 'x', [0, 1, 2], ['rus'], { onPage: () => {}, cancelled: () => false, deps });
  ok(done === 0 && calls === 0, 'no page was recognized');
});
test('the single-page mode and the pager work with FB2 pages', async () => {
  $('mode-btn').click();
  ok(C.classList.contains('paged') && C.querySelectorAll('.cur').length === 1, 'paged');
  await wait(400); key('ArrowRight');
  ok(Number($('page-input').value) >= 2, `page ${$('page-input').value}`);
  $('mode-btn').click();
});
test('after closing, the FB2 card shows its label and title in the library', async () => {
  key('Escape'); await wait(60);
  const cards = [...document.querySelectorAll('.doc')];
  const card = cards.find((c) => c.querySelector('.doc-name').textContent === 'Иван Тестов — Тестовая книга');
  ok(card && card.querySelector('.cover-ph b').textContent === 'FB2', 'card with the FB2 label and the book title');
});
