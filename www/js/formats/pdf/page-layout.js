// Page placeholders: one sized <div> per page; sizes follow the zoom and learn real page sizes as they load.
export function createLayout({ doc, container, first }) {
  const n = doc.numPages;
  const known = new Map([[0, first]]);
  const els = [];
  let scale = 1;
  const page = (i) => known.get(i) ?? first;
  const place = (i) => {
    const v = page(i).getViewport({ scale });
    els[i].style.width = v.width + 'px';
    els[i].style.height = v.height + 'px';
  };
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'pdf-page';
    el.dataset.i = i;
    el.dataset.n = i + 1;
    els.push(el);
    place(i);
  }
  container.replaceChildren(...els);
  return {
    n,
    els,
    scale: () => scale,
    base: (i) => page(i).getViewport({ scale: 1 }),
    setScale(s) { scale = s; for (let i = 0; i < n; i++) place(i); },
    learn(i, p) { known.set(i, p); place(i); },
  };
}
