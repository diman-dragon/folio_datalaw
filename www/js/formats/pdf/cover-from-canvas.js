// Library cover made by down-scaling an already rendered page canvas (no extra pdf.js render).
export function coverFromCanvas(src, width = 240) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = Math.max(1, Math.round((src.height * width) / src.width));
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, c.width, c.height);
  const url = c.toDataURL('image/jpeg', 0.72);
  c.width = c.height = 0;
  return url;
}
