// Closes the viewer: saves progress, tears down everything wired to the document and releases pdf.js.
import { getSession, setSession } from './viewer-session.js';
import { closeOcr } from './ocr-menu.js';
import { suspendPanel } from './tools-panel.js';
import { setActive } from './active-doc.js';
import { detachAnnots } from '../app/annot-persist.js';
import { closePdf } from '../formats/pdf/close-doc.js';
import { updateDoc } from '../data/library.js';
import { emit } from '../core/bus.js';
const $ = (id) => document.getElementById(id);
export async function closeViewer() {
  const s = getSession();
  if (!s) return;
  setSession(null);
  clearTimeout(s.timer);
  updateDoc(s.meta.id, { lastPage: s.list.current() });
  closeOcr();
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
