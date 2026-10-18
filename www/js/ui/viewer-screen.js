// Viewer screen: wires page list, thumbnails, zoom, view mode and keys for one open document.
import { createPageList } from '../formats/pdf/page-list.js';
import { createQueue } from '../formats/pdf/render-queue.js';
import { createThumbs } from '../formats/pdf/thumb-list.js';
import { closePdf } from '../formats/pdf/close-doc.js';
import { createZoom } from './viewer-zoom.js';
import { bindPager } from './viewer-pager.js';
import { bindViewerKeys } from './viewer-keys.js';
import { bindPagedNav } from './viewer-paged-nav.js';
import { bindMode, savedMode } from './viewer-mode.js';
import { resetThumbs } from './thumbs-panel.js';
import { restorePanel, suspendPanel } from './tools-panel.js';
import { dismissTransient } from './edit-dismiss.js';
import { setActive } from './active-doc.js';
import { attachAnnots, detachAnnots } from '../app/annot-persist.js';
import './text-mouse.js';
import './viewer-undo.js';
import './edit-keys.js';
import { coverFromView } from '../app/cover-from-view.js';
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
  suspendPanel();
  setActive(null);
  s.unkeys();
  s.unnav();
  s.zoom.destroy();
  s.list.destroy();
  s.thumbs.destroy();
  s.queue.clear();
  detachAnnots();
  $('viewer-pages').replaceChildren();
  $('viewer').hidden = true;
  await closePdf(s.pdf);
  emit('libchange');
}
export async function openViewer(meta, pdf) {
  await closeViewer();
  const root = $('viewer');
  const scroller = $('viewer-scroll');
  const paged = () => root.dataset.mode === 'paged';
  root.dataset.mode = savedMode();
  $('viewer-title').textContent = stripExt(meta.name);
  $('viewer-back').onclick = closeViewer;
  root.hidden = false;
  resetThumbs();
  attachAnnots(meta.id);
  const s = { meta, pdf, timer: 0, queue: createQueue(2), zoom: null, thumbs: null };
  let list = null;
  const pager = bindPager({ total: pdf.numPages, goTo: (p) => list.goTo(p) });
  list = await createPageList({
    doc: pdf, scroller, container: $('viewer-pages'), queue: s.queue,
    onRendered: (i, canvas) => coverFromView(meta, i, canvas),
    onPage: (p) => {
      pager.show(p);
      s.thumbs?.setCurrent(p);
      if (paged()) s.zoom?.refit();
      clearTimeout(s.timer);
      s.timer = setTimeout(() => updateDoc(meta.id, { lastPage: p }), 400);
    },
  });
  list.setPaged(paged());
  s.list = list;
  s.thumbs = createThumbs({ doc: pdf, root: $('thumbs-list'), queue: s.queue, ratio: list.ratio(), onPick: (p) => list.goTo(p) });
  s.zoom = createZoom({
    list, scroller, initial: meta.zoom ?? null,
    fitKind: () => (paged() ? 'page' : 'width'),
    onChange: (z) => updateDoc(meta.id, { zoom: z }),
  });
  bindMode({ root, list, zoom: s.zoom });
  s.unkeys = bindViewerKeys({ zoom: s.zoom, close: closeViewer, dismiss: dismissTransient, scroller });
  s.unnav = bindPagedNav({ list, scroller, isPaged: paged });
  setActive({ pdf, list, meta });
  restorePanel();
  session = s;
  list.goTo(meta.lastPage ?? 1);
  scroller.focus();
}
