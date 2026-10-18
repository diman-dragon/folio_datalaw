// Renders a pdf.js page into a canvas at device resolution, capped by DPR and pixel count.
const MAX_PX = 8e6;
export function renderPage(page, canvas, scale, dprMax = 2) {
  const css = page.getViewport({ scale });
  let d = Math.min(window.devicePixelRatio || 1, dprMax);
  if (css.width * css.height * d * d > MAX_PX) d = Math.sqrt(MAX_PX / (css.width * css.height));
  const viewport = page.getViewport({ scale: scale * d });
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  canvas.style.cssText = 'width:100%;height:100%;display:block';
  return page.render({ canvas, viewport });
}
