// Zoom controller of the viewer: current zoom (or fit), header buttons, debounced refit on resize.
import { clamp, stepUp, stepDown, fitBox } from '../formats/pdf/zoom.js';
const MAX_FIT = 2;
export function createZoom({ list, scroller, initial, fitKind, onChange }) {
  const label = document.getElementById('zoom-label');
  let fit = initial == null;
  let z = initial ?? 1;
  let timer = 0;
  const apply = () => {
    if (fit) {
      const b = list.fitBase();
      z = Math.min(MAX_FIT, fitBox(scroller.clientWidth - 64, scroller.clientHeight - 32, b.width, b.height, fitKind()));
    }
    list.setScale(z);
    label.textContent = Math.round(z * 100) + '%';
  };
  const set = (v) => { fit = false; z = clamp(v); apply(); onChange(z); };
  const api = {
    in: () => set(stepUp(z)),
    out: () => set(stepDown(z)),
    reset: () => set(1),
    fit: () => { fit = true; apply(); onChange(null); },
    refit: () => { if (fit) apply(); },
  };
  document.getElementById('zoom-in').onclick = api.in;
  document.getElementById('zoom-out').onclick = api.out;
  document.getElementById('zoom-fit').onclick = api.fit;
  const ro = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(api.refit, 150);
  });
  ro.observe(scroller);
  apply();
  return { ...api, destroy: () => { clearTimeout(timer); ro.disconnect(); } };
}
