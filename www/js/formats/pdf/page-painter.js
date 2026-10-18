// Paints pages into their slots: instant low-res preview first, crisp render after; canvases swap in place.
import { renderPage } from './render-page.js';
const FULL_PENALTY = 1e6; // crisp renders wait for the cheap previews of nearby pages
export function createPainter({ doc, queue, scaleOf, dist, learn, onRendered }) {
  const st = new Map();
  const kill = (s) => { try { s.task?.cancel(); } catch { /* already finished */ } s.task = null; };
  const wipe = (c) => { c.width = c.height = 0; c.remove(); };
  const drop = (i) => { queue.drop('p' + i); queue.drop('f' + i); };
  function put(s, canvas, scale, full) {
    const old = s.canvas;
    s.el.append(canvas);
    s.el.classList.add('ready');
    Object.assign(s, { canvas, drawn: scale, full });
    s.el.dispatchEvent(new CustomEvent('pageready', { bubbles: true }));
    if (old) wipe(old);
  }
  async function job(i, s, rev, full) {
    const page = await doc.getPage(i + 1);
    if (s.rev !== rev) return;
    learn?.(i, page);
    const scale = scaleOf();
    const canvas = document.createElement('canvas');
    try {
      s.task = full ? renderPage(page, canvas, scale) : renderPage(page, canvas, scale * 0.5, 1);
      await s.task.promise;
    } catch { wipe(canvas); return; }
    const stale = s.rev !== rev || (!full && s.full && Math.abs(s.drawn - scale) < 1e-3);
    if (stale) { wipe(canvas); return; }
    s.task = null;
    put(s, canvas, scale, full);
    if (full) onRendered?.(i, canvas);
  }
  function free(i) {
    const s = st.get(i);
    if (!s) return;
    s.rev++;
    kill(s);
    drop(i);
    if (s.canvas) wipe(s.canvas);
    s.el.classList.remove('ready');
    s.el.dispatchEvent(new CustomEvent('pagehide', { bubbles: true }));
    st.delete(i);
  }
  return {
    keys: () => [...st.keys()],
    free,
    clear() { [...st.keys()].forEach(free); },
    paint(i, el) {
      let s = st.get(i);
      if (!s) st.set(i, (s = { el, canvas: null, drawn: 0, full: false, task: null, rev: 0 }));
      s.el = el;
      if (s.full && Math.abs(s.drawn - scaleOf()) < 1e-3) return;
      const rev = ++s.rev;
      kill(s);
      drop(i);
      if (!s.canvas) queue.add('p' + i, () => dist(i), () => job(i, s, rev, false));
      queue.add('f' + i, () => dist(i) + FULL_PENALTY, () => job(i, s, rev, true));
    },
    leave(i) {
      const s = st.get(i);
      if (!s) return;
      s.rev++;
      kill(s);
      drop(i);
      if (!s.canvas) free(i);
    },
  };
}
