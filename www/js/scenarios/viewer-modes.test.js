// Scenario: viewer ribbon / single-page modes, zoom, pager and the thumbnail overlay (jsdom, fake pdf.js document).
import test from 'node:test';
import { $, ok, wait, key, paint, fakePdf, mem, observers } from './dom-env.js';
const { addDoc, getDoc } = await import('../data/library.js');
const { openViewer } = await import('../ui/viewer-screen.js');
const meta = addDoc({ path: 'D:\\x\\a.pdf', name: 'a.pdf', size: 1, pages: 12 });
const C = $('viewer-pages'), main = $('viewer-main'), S = $('viewer-scroll');
const click = (el, type = 'pointerdown') => el.dispatchEvent(new window.MouseEvent(type, { bubbles: true }));
await openViewer(meta, fakePdf(12));

test('opens with a placeholder per page and a thumbnail slot per page', () => {
  ok(C.children.length === 12 && $('thumbs-list').children.length === 12, 'slots');
  ok(C.children[0].dataset.n === '1' && $('page-total').textContent === '/ 12', 'numbered placeholders, total');
});
test('painting marks pages ready; zoom keeps canvases and re-renders after a pause', async () => {
  await paint([0, 1, 2]);
  const first = C.children[0].querySelector('canvas');
  ok(C.children[0].classList.contains('ready') && first, 'painted');
  $('zoom-in').click();
  ok(C.children[0].querySelector('canvas') === first, 'old canvas kept while zooming (no flash)');
  await wait(300);
  ok(C.children[0].querySelector('canvas') !== first, 'crisp canvas swapped in after the settle delay');
});
test('zoom controls and shortcuts', () => {
  $('zoom-out').click(); const a = $('zoom-label').textContent;
  key('=', { ctrlKey: true }); ok($('zoom-label').textContent !== a, 'Ctrl+= zooms in');
  key('0', { ctrlKey: true }); ok($('zoom-label').textContent === '100%', 'Ctrl+0 resets');
  $('zoom-fit').click(); ok(getDoc(meta.id).zoom === null, 'fit is stored as null');
});
test('single-page mode: one .cur page, keys flip pages, mode is remembered', async () => {
  $('mode-paged').click();
  ok(C.classList.contains('paged') && C.querySelectorAll('.cur').length === 1, 'paged, one current page');
  ok($('mode-paged').classList.contains('on') && $('mode-paged').getAttribute('aria-pressed') === 'true' && !$('mode-ribbon').classList.contains('on'), 'the pair follows the mode');
  ok($('zoom-fit').textContent === 'По странице' && mem.get('folio.viewMode') === 'paged', 'caption + persisted');
  await wait(400);
  const before = Number($('page-input').value);
  key('ArrowRight'); ok(Number($('page-input').value) === before + 1, 'ArrowRight flips');
  await wait(400); key('End'); ok($('page-input').value === '12', 'End');
  key('Home'); ok($('page-input').value === '1', 'Home');
  $('mode-ribbon').click(); ok(!C.classList.contains('paged'), 'back to ribbon');
});
test('header: the two mode buttons are a toggle pair, the progress line and zoom label work', () => {
  ok($('mode-ribbon').getAttribute('aria-pressed') === 'true' && $('mode-paged').getAttribute('aria-pressed') === 'false', 'ribbon pressed');
  ok($('read-fill').style.width !== '' && Number($('read-progress').getAttribute('aria-valuenow')) > 0, 'reading progress ' + $('read-fill').style.width);
  $('zoom-in').click(); $('zoom-label').click();
  ok($('zoom-label').textContent === '100%', 'clicking the percentage resets the zoom');
  $('zoom-fit').click();
});
test('thumbnails are an overlay: edge / button open, outside click closes, pin keeps', () => {
  ok(!main.classList.contains('open'), 'closed by default');
  $('thumbs-hot').dispatchEvent(new window.MouseEvent('mouseenter')); ok(main.classList.contains('open'), 'edge opens');
  click(S); ok(!main.classList.contains('open'), 'outside click closes');
  $('thumbs-btn').click(); click($('thumbs-list')); ok(main.classList.contains('open'), 'inside click keeps it open');
  ok($('thumbs-btn').classList.contains('on'), 'header button is marked .on while open');
  $('pin-btn').click(); click(S);
  ok($('pin-btn').classList.contains('on'), 'pin button is marked .on');
  ok(main.classList.contains('open') && mem.get('folio.thumbsPinned') === '1', 'pin keeps it open and is remembered');
  ok(S.clientWidth === 1000, 'the page area is never resized by the overlay');
  $('pin-btn').click(); click(S); ok(!main.classList.contains('open'), 'unpinned: closes again');
});
test('thumbnail click navigates and Esc closes the viewer at the end', async () => {
  $('thumbs-list').children[4].click();
  ok($('page-input').value === '5' && $('thumbs-list').children[4].classList.contains('cur'), 'navigates, highlights');
  key('Escape'); await wait(30);
  ok($('viewer').hidden && C.children.length === 0, 'Esc closes and tears down');
  ok(getDoc(meta.id).lastPage >= 1 && observers.length > 0, 'progress saved');
});
