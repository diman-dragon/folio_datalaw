// Viewer shortcuts: Ctrl +/-/0 and Ctrl+wheel zoom, Esc closes (arrows / PgUp / PgDn scroll natively).
export function bindViewerKeys({ zoom, close, scroller }) {
  let lastWheel = 0;
  const onKey = (e) => {
    if (e.key === 'Escape') { close(); return; }
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === '=' || e.key === '+') zoom.in();
    else if (e.key === '-') zoom.out();
    else if (e.key === '0') zoom.reset();
    else return;
    e.preventDefault();
  };
  const onWheel = (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    if (Date.now() - lastWheel < 120) return;
    lastWheel = Date.now();
    if (e.deltaY < 0) zoom.in(); else zoom.out();
  };
  document.addEventListener('keydown', onKey);
  scroller.addEventListener('wheel', onWheel, { passive: false });
  return () => {
    document.removeEventListener('keydown', onKey);
    scroller.removeEventListener('wheel', onWheel);
  };
}
