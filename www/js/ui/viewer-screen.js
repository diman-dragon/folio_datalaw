// Viewer screen: shows a pdf.js document in a virtualised ribbon; saves page and zoom to the library.
import { createPageList } from '../formats/pdf/page-list.js';
import { closePdf } from '../formats/pdf/close-doc.js';
import { createZoom } from './viewer-zoom.js';
import { bindPager } from './viewer-pager.js';
import { bindViewerKeys } from './viewer-keys.js';
import { updateDoc } from '../data/library.js';
import { stripExt } from '../core/format.js';
import { emit } from '../core/bus.js';
const $ = (id) => document.getElementById(id);
let session = null;
export async function closeViewer() {
  const s = session;
  if (!s) return;
  session = null;
  clearTimeout(s.timer);
  updateDoc(s.meta.id, { lastPage: s.list.current() });
  s.unkeys();
  s.zoom.destroy();
  s.list.destroy();
  $('viewer-pages').replaceChildren();
  $('viewer').hidden = true;
  await closePdf(s.pdf);
  emit('libchange');
}
export async function openViewer(meta, pdf) {
  await closeViewer();
  const scroller = $('viewer-scroll');
  $('viewer-title').textContent = stripExt(meta.name);
  $('viewer-back').onclick = closeViewer;
  $('viewer').hidden = false;
  let list = null;
  const s = { meta, pdf, timer: 0 };
  const pager = bindPager({ total: pdf.numPages, goTo: (p) => list.goTo(p) });
  list = await createPageList({
    doc: pdf, scroller, container: $('viewer-pages'),
    onPage: (p) => {
      pager.show(p);
      clearTimeout(s.timer);
      s.timer = setTimeout(() => updateDoc(meta.id, { lastPage: p }), 400);
    },
  });
  s.list = list;
  s.zoom = createZoom({ list, scroller, initial: meta.zoom ?? null, onChange: (z) => updateDoc(meta.id, { zoom: z }) });
  s.unkeys = bindViewerKeys({ zoom: s.zoom, close: closeViewer, scroller });
  session = s;
  list.goTo(meta.lastPage ?? 1);
  scroller.focus();
}
