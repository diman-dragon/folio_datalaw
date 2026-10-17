// Virtualised page ribbon: a placeholder per page, a canvas only for pages near the viewport.
import { renderPage } from './render-page.js';
import { pageAt } from './page-at.js';
export async function createPageList({ doc, scroller, container, onPage }) {
  const n = doc.numPages;
  const first = await doc.getPage(1);
  const known = new Map([[0, first]]);
  const els = [];
  const live = new Map();
  let scale = 1, cur = 1, raf = 0, started = false;
  const place = (i) => {
    const v = (known.get(i) ?? first).getViewport({ scale });
    els[i].style.width = v.width + 'px';
    els[i].style.height = v.height + 'px';
  };
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'pdf-page';
    el.dataset.i = i;
    els.push(el);
    place(i);
  }
  container.replaceChildren(...els);
  const topOf = (i) => els[i].offsetTop + container.offsetTop;
  function free(i) {
    const l = live.get(i);
    if (!l) return;
    live.delete(i);
    l.task?.cancel();
    l.canvas.width = l.canvas.height = 0;
    l.canvas.remove();
  }
  async function draw(i) {
    if (live.has(i)) return;
    const l = { canvas: document.createElement('canvas'), task: null };
    live.set(i, l);
    try {
      const page = await doc.getPage(i + 1);
      if (live.get(i) !== l) return;
      known.set(i, page);
      place(i);
      l.task = renderPage(page, l.canvas, scale);
      await l.task.promise;
      if (live.get(i) === l) els[i].append(l.canvas);
    } catch (e) {
      if (live.get(i) === l && e?.name !== 'RenderingCancelledException') live.delete(i);
    }
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const i = Number(e.target.dataset.i);
      if (e.isIntersecting) draw(i); else free(i);
    }
  }, { root: scroller, rootMargin: '1500px 0px' });
  function track() {
    raf = 0;
    const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
    const y = scroller.scrollTop + Math.min(scroller.clientHeight / 3, 120);
    const p = atEnd ? n : pageAt(n, topOf, y) + 1;
    if (p !== cur) { cur = p; onPage(p); }
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(track); };
  scroller.addEventListener('scroll', onScroll, { passive: true });
  return {
    pageCount: n,
    baseWidth: () => first.getViewport({ scale: 1 }).width,
    current: () => cur,
    setScale(s) {
      if (started && Math.abs(s - scale) < 1e-4) return;
      const i = cur - 1;
      const frac = started ? (scroller.scrollTop - topOf(i)) / Math.max(1, els[i].offsetHeight) : 0;
      scale = s;
      [...live.keys()].forEach(free);
      for (let k = 0; k < n; k++) place(k);
      if (started) scroller.scrollTop = topOf(i) + frac * els[i].offsetHeight;
      started = true;
      els.forEach((el) => { io.unobserve(el); io.observe(el); });
    },
    goTo(p) {
      const i = Math.min(n, Math.max(1, Math.round(p) || 1)) - 1;
      scroller.scrollTop = topOf(i) - 12;
      cur = i + 1;
      onPage(cur);
    },
    destroy() {
      scroller.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      io.disconnect();
      [...live.keys()].forEach(free);
    },
  };
}
