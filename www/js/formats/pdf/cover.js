// First-page thumbnail of an opened pdf.js document as a small JPEG data URL (library cover).
export async function pdfCover(pdf, width = 240) {
  const page = await pdf.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: width / base.width });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await page.render({ canvas, viewport, background: '#ffffff' }).promise;
  const url = canvas.toDataURL('image/jpeg', 0.72);
  canvas.width = canvas.height = 0;
  return url;
}
