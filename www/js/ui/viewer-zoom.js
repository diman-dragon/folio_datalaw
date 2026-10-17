// Zoom controller of the viewer: current zoom (or fit-to-width), header buttons, resize refit.
import { clamp, stepUp, stepDown, fitWidth } from '../formats/pdf/zoom.js';
const MAX_FIT = 2;
export function createZoom({ list, scroller, initial, onChange }) {
  const label = document.getElementById('zoom-label');
  let fit = initial == null;
  let z = initial ?? 1;
  let timer = 0;
  const apply = () => {
    if (fit) z = Math.min(MAX_FIT, fitWidth(scroller.clientWidth - 48, list.baseWidth()));
    list.setScale(z);
    label.textContent = Math.round(z * 100) + '%';
  };
  const set = (v) => { fit = false; z = clamp(v); apply(); onChange(z); };
  const api = {
    in: () => set(stepUp(z)),
    out: () => set(stepDown(z)),
    reset: () => set(1),
    fit: () => { fit = true; apply(); onChange(null); },
  };
  document.getElementById('zoom-in').onclick = api.in;
  document.getElementById('zoom-out').onclick = api.out;
  document.getElementById('zoom-fit').onclick = api.fit;
  const ro = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => { if (fit) apply(); }, 150);
  });
  ro.observe(scroller);
  apply();
  return { ...api, destroy: () => { clearTimeout(timer); ro.disconnect(); } };
}
