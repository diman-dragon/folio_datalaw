// Single-page mode navigation: arrows / PgUp / PgDn / Home / End and the wheel flip pages (when the page fits or at its edge).
export function bindPagedNav({ list, scroller, isPaged }) {
  let last = 0;
  const flip = (d, gap) => {
    if (Date.now() - last < gap) return;
    last = Date.now();
    list.goTo(list.current() + d);
  };
  const fits = () => scroller.scrollHeight <= scroller.clientHeight + 2;
  const atEnd = () => scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
  const atTop = () => scroller.scrollTop <= 0;
  const onKey = (e) => {
    if (!isPaged() || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (k === 'ArrowRight') flip(1, 120);
    else if (k === 'ArrowLeft') flip(-1, 120);
    else if ((k === 'PageDown' || k === ' ') && (fits() || atEnd())) flip(1, 120);
    else if (k === 'PageUp' && (fits() || atTop())) flip(-1, 120);
    else if (k === 'Home') list.goTo(1);
    else if (k === 'End') list.goTo(list.pageCount);
    else return;
    e.preventDefault();
  };
  const onWheel = (e) => {
    if (!isPaged() || e.ctrlKey) return;
    if (e.deltaY > 0 && (fits() || atEnd())) flip(1, 350);
    else if (e.deltaY < 0 && (fits() || atTop())) flip(-1, 350);
    else return;
    e.preventDefault();
  };
  document.addEventListener('keydown', onKey);
  scroller.addEventListener('wheel', onWheel, { passive: false });
  return () => {
    document.removeEventListener('keydown', onKey);
    scroller.removeEventListener('wheel', onWheel);
  };
}
