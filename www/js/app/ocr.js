// OCR orchestration: render a page for recognition, run the engine, keep the result as a selectable text layer and in storage.
import { recognize } from '../io/ocr-engine.js';
import { renderForOcr } from '../formats/pdf/ocr-source.js';
import { saveOcr } from '../data/ocr-store.js';
const REAL = { recognize, render: renderForOcr }; // swapped in tests
export async function recognizePage(active, docId, i, langs, onProgress, deps = REAL) {
  const src = await deps.render(active.pdf, i);
  const words = await deps.recognize(src.canvas, langs, onProgress);
  const k = src.w / src.canvas.width;
  src.canvas.width = 0;
  const data = { w: src.w, h: src.h, words: words.map((x) => [x.text, x.x0 * k, x.y0 * k, (x.x1 - x.x0) * k, (x.y1 - x.y0) * k]) };
  active.text.setOcr(i, data);
  await saveOcr(docId, i, data);
  return data;
}
// Pages that already have text (native or recognized) are skipped. Returns how many pages were recognized.
export async function recognizePages(active, docId, pages, langs, { onPage, cancelled, deps = REAL }) {
  let done = 0;
  for (let n = 0; n < pages.length && !cancelled(); n++) {
    const i = pages[n];
    onPage(n + 1, pages.length, 0);
    if (await active.text.hasText(i)) continue;
    await recognizePage(active, docId, i, langs, (p) => onPage(n + 1, pages.length, p), deps);
    done++;
  }
  return done;
}
