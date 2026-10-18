// Thumbnail strip: lazy small renders (lowest queue priority), current highlight, click to navigate.
import { renderPage } from './render-page.js';
const WIDTH = 120;   // thumbnail css width, px
const PENALTY = 5e6; // thumbnails always yield to page renders
export function createThumbs({ doc, root, queue, ratio, onPick }) {
  const n = doc.numPages;
  const items = [];
  const boxes = [];
  const live = new Map();
  let cur = 1;
  for (let i = 0; i < n; i++) {
    const it = document.createElement('div');
    it.className = 'thumb';
    it.dataset.i = i;
    it.innerHTML = '<div class="thumb-box"></div><span class="thumb-n"></span>';
    it.querySelector('.thumb-n').textContent = i + 1;
    it.firstChild.style.aspectRatio = String(ratio);
    items.push(it);
    boxes.push(it.firstChild);
  }
  root.replaceChildren(...items);
  function free(i) {
    const l = live.get(i);
    if (!l) return;
    live.delete(i);
    queue.drop('t' + i);
    try { l.task?.cancel(); } catch { /* already finished */ }
    l.canvas.width = l.canvas.height = 0;
    l.canvas.remove();
  }
  function draw(i) {
    if (live.has(i)) return;
    const l = { canvas: document.createElement('canvas'), task: null };
    live.set(i, l);
    queue.add('t' + i, () => PENALTY + Math.abs(i + 1 - cur), async () => {
      if (live.get(i) !== l) return;
      try {
        const page = await doc.getPage(i + 1);
        if (live.get(i) !== l) return;
        const v = page.getViewport({ scale: 1 });
        boxes[i].style.aspectRatio = String(v.width / v.height);
        l.task = renderPage(page, l.canvas, WIDTH / v.width, 1.5);
        await l.task.promise;
        if (live.get(i) === l) boxes[i].append(l.canvas);
      } catch { if (live.get(i) === l) live.delete(i); }
    });
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const i = Number(e.target.dataset.i);
      if (e.isIntersecting) draw(i); else free(i);
    }
  }, { root, rootMargin: '500px 0px' });
  items.forEach((it) => io.observe(it));
  root.onclick = (e) => {
    const t = e.target.closest('.thumb');
    if (t) onPick(Number(t.dataset.i) + 1);
  };
  return {
    setCurrent(p) {
      items[cur - 1]?.classList.remove('cur');
      cur = p;
      const it = items[p - 1];
      if (!it) return;
      it.classList.add('cur');
      const top = it.offsetTop;
      const bottom = top + it.offsetHeight;
      if (top < root.scrollTop) root.scrollTop = top - 8;
      else if (bottom > root.scrollTop + root.clientHeight) root.scrollTop = bottom - root.clientHeight + 8;
    },
    destroy() {
      io.disconnect();
      [...live.keys()].forEach(free);
      root.onclick = null;
      root.replaceChildren();
    },
  };
}
