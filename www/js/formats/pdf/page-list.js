// Page ribbon / single-page view: layout, lazy painting near the viewport, scroll tracking, navigation.
import { createLayout } from './page-layout.js';
import { createPainter } from './page-painter.js';
import { createQueue } from './render-queue.js';
import { pageAt } from './page-at.js';
const MARGIN = 700; // px around the viewport that get painted
const SETTLE = 140; // ms after a zoom change before the crisp re-render
export async function createPageList({ doc, scroller, container, onPage, onRendered, queue = createQueue(2) }) {
  const first = await doc.getPage(1);
  const lay = createLayout({ doc, container, first });
  const { n, els } = lay;
  const vis = new Set();
  let cur = 1, raf = 0, started = false, paged = false, tz = 0, ts = 0;
  const topOf = (i) => els[i].offsetTop + container.offsetTop;
  const mid = () => scroller.scrollTop + scroller.clientHeight / 2;
  const dist = (i) => (paged ? Math.abs(i + 1 - cur) * 1e4 : Math.abs(topOf(i) + els[i].offsetHeight / 2 - mid()));
  const painter = createPainter({ doc, queue, dist, scaleOf: lay.scale, learn: lay.learn, onRendered });
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const i = Number(e.target.dataset.i);
      if (e.isIntersecting) { vis.add(i); painter.paint(i, e.target); } else { vis.delete(i); painter.leave(i); }
    }
  }, { root: scroller, rootMargin: `${MARGIN}px 0px` });
  const sweep = () => {
    const far = scroller.clientHeight * 4 + 2000;
    for (const i of painter.keys()) if (!vis.has(i) && dist(i) > far) painter.free(i);
  };
  const idle = () => { clearTimeout(ts); ts = setTimeout(sweep, 300); };
  function track() {
    raf = 0;
    if (paged) return;
    const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
    const p = atEnd ? n : pageAt(n, topOf, scroller.scrollTop + Math.min(scroller.clientHeight / 3, 120)) + 1;
    if (p !== cur) { cur = p; onPage(p); }
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(track); idle(); };
  scroller.addEventListener('scroll', onScroll, { passive: true });
  return {
    pageCount: n,
    current: () => cur,
    ratio: () => { const v = lay.base(0); return v.width / v.height; },
    fitBase: () => lay.base(paged ? cur - 1 : 0),
    setPaged(on) {
      if (on === paged) return;
      paged = on;
      container.classList.toggle('paged', on);
      els.forEach((el) => el.classList.remove('cur'));
      if (on) els[cur - 1].classList.add('cur');
      scroller.scrollTop = on ? 0 : topOf(cur - 1) - 12;
    },
    setScale(s) {
      if (started && Math.abs(s - lay.scale()) < 1e-4) return;
      const i = cur - 1;
      const keep = started && !paged;
      const frac = keep ? (scroller.scrollTop - topOf(i)) / Math.max(1, els[i].offsetHeight) : 0;
      lay.setScale(s);
      if (keep) scroller.scrollTop = topOf(i) + frac * els[i].offsetHeight;
      if (!started) { started = true; els.forEach((el) => io.observe(el)); return; }
      clearTimeout(tz);
      tz = setTimeout(() => { vis.forEach((k) => painter.paint(k, els[k])); idle(); }, SETTLE);
    },
    goTo(p) {
      const i = Math.min(n, Math.max(1, Math.round(p) || 1)) - 1;
      if (paged) { els[cur - 1].classList.remove('cur'); els[i].classList.add('cur'); scroller.scrollTop = 0; }
      else scroller.scrollTop = topOf(i) - 12;
      cur = i + 1;
      onPage(cur);
    },
    destroy() {
      scroller.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(tz);
      clearTimeout(ts);
      io.disconnect();
      painter.clear();
      container.classList.remove('paged');
    },
  };
}
