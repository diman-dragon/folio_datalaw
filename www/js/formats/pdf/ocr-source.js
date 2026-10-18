// Renders a page into a canvas sized for text recognition (about 150 dpi of an A4 page); sizes are in page units.
const TARGET_W = 1600;
export async function renderForOcr(pdf, i) {
  const page = await pdf.getPage(i + 1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: Math.min(TARGET_W / base.width, 2400 / base.height) });
  const canvas = Object.assign(document.createElement('canvas'), { width: Math.floor(viewport.width), height: Math.floor(viewport.height) });
  await page.render({ canvas, viewport, background: '#ffffff' }).promise;
  return { canvas, w: base.width, h: base.height };
}
