// Scenario: annotations survive closing and reopening a document; the OCR sheet opens and closes with Esc.
import test from 'node:test';
import { $, ok, wait, key, paint, fakePdf, drag, mem } from './dom-env.js';
const { addDoc, getDoc } = await import('../data/library.js');
const { openViewer } = await import('../ui/viewer-screen.js');
const { getItems } = await import('../ui/annot-data.js');
const meta = addDoc({ path: 'D:\\x\\a.pdf', name: 'a.pdf', size: 1, pages: 4 });
const C = $('viewer-pages');
const pdf = fakePdf();
await openViewer(meta, pdf);
await paint();

test('annotations are saved after a change (debounced)', async () => {
  $('edit-btn').click();
  document.querySelector('.tp-btn[data-tool="pen"]').click();
  await drag([[100, 100], [200, 160]]);
  await drag([[100, 300], [260, 320]]);
  await wait(800);
  const saved = JSON.parse(mem.get(`folio.annot.${meta.id}`) ?? 'null');
  ok(saved && saved[0].length === 2, 'two strokes persisted');
});
test('closing drops the tool and the panel; reopening restores the strokes without history', async () => {
  key('Escape'); await wait(20); // tool off
  key('Escape'); await wait(60); // viewer closed
  ok($('viewer').hidden && $('tools-panel').hidden && $('viewer').dataset.editTool === '', 'closed cleanly');
  await openViewer(getDoc(meta.id), pdf);
  await paint();
  ok(getItems(0).length === 2 && C.children[0].querySelectorAll('.annot path').length === 2, 'strokes restored and painted');
  ok($('undo-btn').disabled, 'history starts empty');
});
test('OCR sheet lists the installed languages and Esc closes it before the viewer', async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ engine: 5, langs: ['rus', 'eng', 'ita', 'srp', 'srp_latn'], core: [] }) });
  $('edit-btn').click();
  $('tp-ocr').click(); await wait(30);
  ok(!$('ocr-sheet').hidden && $('ocr-langs').children.length === 5, 'sheet with 5 chips');
  ok($('tp-ocr').classList.contains('active'), 'OCR button shows it is open');
  key('Escape'); ok($('ocr-sheet').hidden && !$('viewer').hidden, 'Esc closes the sheet only');
  ok(!$('tp-ocr').classList.contains('active'), 'OCR button is released');
});
