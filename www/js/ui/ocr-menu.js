// OCR sheet: pick recognition languages, recognize this page or the whole document, show progress (cancellable).
import { recognizePages } from '../app/ocr.js';
import { ocrInfo, stopOcr } from '../io/ocr-engine.js';
import { getActive } from './active-doc.js';
import { toast } from './toast.js';
import { t } from '../core/strings.js';
import { getPref, setPref } from '../core/prefs.js';
const $ = (id) => document.getElementById(id);
const sheet = $('ocr-sheet'), chips = $('ocr-langs'), run = $('ocr-run'), errBox = $('ocr-error');
let busy = false, stop = false;
let langs = getPref('ocrlangs', ['eng', 'rus']);
async function paintChips() {
  const info = await ocrInfo();
  chips.replaceChildren(...(info?.langs ?? []).map((code) => {
    const b = Object.assign(document.createElement('button'), { className: `ocr-chip${langs.includes(code) ? ' on' : ''}`, textContent: t(`ocr.lang.${code}`) });
    b.addEventListener('click', () => {
      langs = langs.includes(code) ? langs.filter((x) => x !== code) : [...langs, code];
      if (!langs.length) langs = [code];
      setPref('ocrlangs', langs);
      paintChips();
    });
    return b;
  }));
}
export const ocrSheetOpen = () => !sheet.hidden;
export const hideOcr = () => { sheet.hidden = true; };
export async function toggleOcr(force) {
  sheet.hidden = !(force ?? sheet.hidden);
  if (sheet.hidden) return;
  await paintChips();
  if (!(await ocrInfo())) toast(t('ocr.missing'));
}
// Viewer is closing: stop a running recognition and hide the sheet.
export function closeOcr() {
  stop = true;
  hideOcr();
  stopOcr();
}
async function start(pages) {
  const a = getActive();
  if (busy || !a) return;
  busy = true; stop = false; run.hidden = false; errBox.hidden = true;
  const fill = $('ocr-fill'), status = $('ocr-status');
  try {
    const done = await recognizePages(a, a.meta.id, pages(a), langs, {
      cancelled: () => stop,
      onPage: (i, n, p) => {
        fill.style.width = `${((i - 1 + p) / n) * 100}%`;
        status.textContent = t('ocr.progress').replace('{i}', i).replace('{n}', n).replace('{p}', Math.round(p * 100));
      },
    });
    if (!stop) { toast(t(done ? 'ocr.done' : 'ocr.nothing')); hideOcr(); }
  } catch (err) {
    const missing = err.message === 'ocr-missing' || err.message === 'ocr-lang';
    errBox.textContent = missing ? t('ocr.missing') : `${t('ocr.fail')}: ${String(err?.message ?? err).slice(0, 300)}`;
    errBox.hidden = false;
  }
  busy = false;
  run.hidden = true;
}
$('ocr-page').addEventListener('click', () => start((a) => [a.list.current() - 1]));
$('ocr-all').addEventListener('click', () => start((a) => Array.from({ length: a.pdf.numPages }, (_, i) => i)));
$('ocr-close').addEventListener('click', () => hideOcr());
$('ocr-cancel').addEventListener('click', () => { stop = true; stopOcr(); });
