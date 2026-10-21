// An FB2 book behind the same small interface the viewer uses for pdf.js documents: pages, viewports, render, text.
import { isZip, unzipFb2 } from './fb2-zip.js';
import { decodeXml } from './fb2-decode.js';
import { parseFb2 } from './fb2-parse.js';
import { paginate, PAGE } from './fb2-layout.js';
import { charTable } from './fb2-chars.js';
import { drawPage } from './fb2-render.js';
// deps: { measure(text, font) -> px, decodeImage(type, base64) -> {bitmap,w,h}, parseXml(text) -> XML document }
export async function openFb2(bytes, deps) {
  const model = parseFb2(decodeXml(isZip(bytes) ? await unzipFb2(bytes) : bytes), deps.parseXml);
  const images = new Map(), sizes = new Map();
  for (const id of model.imageIds) {
    const bin = model.binaries.get(id);
    const img = bin ? await deps.decodeImage(bin.type, bin.b64).catch(() => null) : null;
    if (img) { images.set(id, img.bitmap); sizes.set(id, { w: img.w, h: img.h }); }
  }
  const pages = paginate(model.blocks, deps.measure, (id) => sizes.get(id) ?? null);
  const proxies = new Map();
  const proxy = (n) => {
    if (!proxies.has(n)) {
      const data = pages[n - 1];
      proxies.set(n, {
        getViewport: ({ scale }) => ({ scale, width: PAGE.w * scale, height: PAGE.h * scale, transform: [scale, 0, 0, -scale, 0, PAGE.h * scale] }),
        render: ({ canvas, viewport }) => {
          const ctx = canvas.getContext('2d');
          ctx.setTransform(viewport.scale, 0, 0, viewport.scale, 0, 0);
          drawPage(ctx, data, images);
          return { promise: Promise.resolve(), cancel() {} };
        },
        chars: async () => charTable(data, deps.measure),
      });
    }
    return proxies.get(n);
  };
  return {
    kind: 'fb2',
    numPages: pages.length,
    title: model.author ? `${model.author} — ${model.title}` : model.title,
    getPage: async (n) => {
      if (!Number.isInteger(n) || n < 1 || n > pages.length) throw new Error('page out of range');
      return proxy(n);
    },
    loadingTask: { destroy: async () => { images.forEach((b) => b.close?.()); images.clear(); } },
  };
}
