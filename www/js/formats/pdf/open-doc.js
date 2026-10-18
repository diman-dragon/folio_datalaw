// Opens PDF bytes as a pdf.js document; asks for a password through the given callback.
import { pdfjs, ASSETS } from './pdfjs.js';
// NB: pdf.js takes over `bytes` (the buffer is transferred to its worker and detached).
export async function openPdf(bytes, { askPassword = null } = {}) {
  const lib = await pdfjs();
  const task = lib.getDocument({
    data: bytes,
    isEvalSupported: false,
    enableHWA: true, // GPU canvas: the single biggest rendering speed-up
    cMapUrl: ASSETS + 'cmaps/', cMapPacked: true,
    standardFontDataUrl: ASSETS + 'standard_fonts/',
    wasmUrl: ASSETS + 'wasm/', iccUrl: ASSETS + 'iccs/',
  });
  let cancelled = false;
  task.onPassword = async (update, reason) => {
    const pw = askPassword ? await askPassword(reason === 2) : null;
    if (pw == null) { cancelled = true; task.destroy(); } else update(pw);
  };
  try {
    return await task.promise;
  } catch (e) {
    if (!cancelled) throw e;
    throw Object.assign(new Error('cancelled'), { cancelled: true });
  }
}
