// Scenario: text tools (underline, highlight), mouse selection, bubble menu, copy, double-click, Esc order.
import test from 'node:test';
import { $, ok, wait, key, paint, fakePdf, drag, copied, TEXT } from './dom-env.js';
const { addDoc } = await import('../data/library.js');
const { openViewer } = await import('../ui/viewer-screen.js');
const { getItems } = await import('../ui/annot-data.js');
const meta = addDoc({ path: 'D:\\x\\a.pdf', name: 'a.pdf', size: 1, pages: 4 });
const C = $('viewer-pages');
const tool = (name) => document.querySelector(`.tp-btn[data-tool="${name}"]`).click();
const boxes = () => C.children[0].querySelectorAll('.sel-box').length;
await openViewer(meta, fakePdf());
await paint();
$('edit-btn').click();

test('underline tool marks the dragged range, a little below the text box', async () => {
  tool('underline');
  await drag([[60, 95], [200, 95]]);
  const tu = getItems(0).find((i) => i.k === 'tu');
  ok(tu && tu.r.length === 1, 'underline stored');
  const d = [...C.children[0].querySelectorAll('.annot-ink path')].map((p) => p.getAttribute('d')).find((x) => /^M[\d.]+ [\d.]+h[\d.]+$/.test(x));
  const lineY = Number(d.match(/^M[\d.]+ ([\d.]+)h/)[1]);
  const [, y, , h] = tu.r[0];
  ok(lineY > (y + h) * (700 / 500), `line y ${lineY.toFixed(3)} is below the box bottom ${((y + h) * 1.4).toFixed(3)}`);
});
test('text-select tool highlights the dragged range', async () => {
  tool('text-select');
  await drag([[60, 95], [120, 95]]);
  ok(getItems(0).some((i) => i.k === 'th'), 'highlight stored');
  tool('text-select');
});
test('plain mouse drag selects text and shows the bubble menu; Ctrl+C copies', async () => {
  await drag([[52, 95], [160, 95]]);
  await wait(40);
  ok(boxes() === 1 && !$('text-menu').hidden, 'selection box and menu');
  key('c', { ctrlKey: true }); await wait(20);
  ok(copied() && TEXT.startsWith(copied().slice(0, 5)), `copied "${copied()}"`);
});
test('menu: highlight adds a mark and clears the selection', () => {
  const before = getItems(0).filter((i) => i.k === 'th').length;
  document.querySelector('#text-menu [data-act="hl"]').click();
  ok(getItems(0).filter((i) => i.k === 'th').length === before + 1 && $('text-menu').hidden && boxes() === 0, 'mark added');
});
test('Esc clears a selection first, double-click selects a word', async () => {
  await drag([[52, 95], [160, 95]]); await wait(40);
  key('Escape'); ok(boxes() === 0 && !$('viewer').hidden, 'Esc cleared the selection, viewer stays');
  C.children[0].dispatchEvent(new window.MouseEvent('dblclick', { bubbles: true, clientX: 55, clientY: 95 })); await wait(40);
  ok(boxes() === 1, 'word selected'); key('Escape');
});
