// Scenario: palette, pen / marker / eraser strokes, undo / redo with header buttons and shortcuts.
import test from 'node:test';
import { $, ok, key, paint, fakePdf, drag } from './dom-env.js';
const { addDoc } = await import('../data/library.js');
const { openViewer } = await import('../ui/viewer-screen.js');
const { getItems } = await import('../ui/annot-data.js');
const meta = addDoc({ path: 'D:\\x\\a.pdf', name: 'a.pdf', size: 1, pages: 4 });
const C = $('viewer-pages');
const tool = (name) => document.querySelector(`.tp-btn[data-tool="${name}"]`).click();
const paths = (sel) => C.children[0].querySelectorAll(sel).length;
await openViewer(meta, fakePdf());
await paint();

test('palette: pin sits in the top-left head, the grid has the OCR button', () => {
  $('edit-btn').click();
  ok(!$('tools-panel').hidden, 'opens');
  ok($('tp-pin').parentElement.classList.contains('tp-head'), 'pin in the head');
  ok(!document.querySelector('.tp-grid #tp-pin') && document.querySelector('.tp-grid #tp-ocr'), 'OCR in the grid');
});
test('pen draws a stroke into the ink layer and stores it', async () => {
  tool('pen');
  ok($('viewer').classList.contains('draw-active') && $('viewer').dataset.editTool === 'pen', 'pen active');
  await drag([[100, 100], [140, 120], [200, 150], [260, 160]]);
  ok(getItems(0).length === 1 && getItems(0)[0].k === 'pen' && paths('.annot-ink path') === 1, 'stored and drawn');
});
test('undo / redo: buttons always enabled by history, Ctrl+Z / Ctrl+Y, tooltip with step count', () => {
  ok(!$('undo-btn').disabled && /шагов: 1/.test($('undo-btn').title), 'undo enabled, tooltip counts');
  key('z', { ctrlKey: true }); ok(getItems(0).length === 0 && paths('.annot-ink path') === 0, 'Ctrl+Z removes data and svg');
  ok(!$('redo-btn').disabled, 'redo enabled');
  key('y', { ctrlKey: true }); ok(getItems(0).length === 1 && paths('.annot-ink path') === 1, 'Ctrl+Y restores');
  key('z', { ctrlKey: true, shiftKey: false }); key('z', { ctrlKey: true, shiftKey: true });
  ok(getItems(0).length === 1, 'Ctrl+Shift+Z also redoes');
});
test('marker goes to the mark layer', async () => {
  tool('highlighter');
  await drag([[100, 300], [300, 300]]);
  ok(getItems(0).some((i) => i.k === 'hl') && paths('.annot-mark path') === 1, 'marker stroke in the mark layer');
});
test('eraser removes only what it crosses, as one undoable step', async () => {
  tool('eraser');
  await drag([[180, 100], [180, 200]]);
  ok(!getItems(0).some((i) => i.k === 'pen') && getItems(0).some((i) => i.k === 'hl'), 'pen stroke erased, marker kept');
  $('undo-btn').click(); ok(getItems(0).some((i) => i.k === 'pen'), 'undo restores it');
});
test('the mouse cursor becomes the chosen tool and follows the colour', () => {
  const cur = () => $('viewer').style.getPropertyValue('--tool-cursor');
  tool('eraser'); // the previous test left the eraser active: click it off
  ok(cur() === '', 'no tool: default cursor');
  tool('pen');
  ok(cur().includes('data:image/svg+xml') && cur().endsWith('3 29, crosshair'), 'pen cursor with its hotspot');
  const pen = cur();
  tool('eraser'); ok(cur() !== pen && cur().includes('data:image/svg+xml'), 'eraser has its own cursor');
  tool('eraser'); ok(cur() === '', 'tool off: cursor reset');
  tool('pen');
  document.querySelector('.color-dot[data-color="#ef4444"]').click();
  ok(decodeURIComponent(cur()).includes('#ef4444'), 'changing the colour repaints the cursor');
  ok(document.querySelector('.tp-btn[data-tool="pen"]').classList.contains('active'), 'chosen tool button is marked .active');
  tool('pen');
});
test('clicking the active tool turns it off; closing the panel drops the tool', () => {
  tool('eraser'); ok($('viewer').dataset.editTool === 'eraser', 'chosen');
  tool('eraser'); ok($('viewer').dataset.editTool === '', 'clicking it again turns it off');
  tool('pen'); $('tp-hide').click();
  ok($('tools-panel').hidden && $('viewer').dataset.editTool === '', 'panel hidden, tool dropped');
});
