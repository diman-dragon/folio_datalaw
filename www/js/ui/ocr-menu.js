// OCR sheet: open / close, the "this page / whole document" buttons; delegates languages and running.
import { ocrInfo } from '../io/ocr-engine.js';
import { paintChips } from './ocr-langs.js';
import { runOcr, cancelRun } from './ocr-run.js';
import { toast } from './toast.js';
import { t } from '../core/strings.js';
const $ = (id) => document.getElementById(id);
const sheet = $('ocr-sheet');
export const ocrSheetOpen = () => !sheet.hidden;
const mark = () => $('tp-ocr').classList.toggle('active', !sheet.hidden);
export const hideOcr = () => { sheet.hidden = true; mark(); };
export async function toggleOcr(force) {
  sheet.hidden = !(force ?? sheet.hidden);
  mark();
  if (sheet.hidden) return;
  await paintChips($('ocr-langs'));
  if (!(await ocrInfo())) toast(t('ocr.missing'));
}
// The viewer is closing: stop a running recognition and hide the sheet.
export function closeOcr() {
  cancelRun();
  hideOcr();
}
const start = async (pages) => { if (await runOcr(pages)) hideOcr(); };
$('ocr-page').addEventListener('click', () => start((a) => [a.list.current() - 1]));
$('ocr-all').addEventListener('click', () => start((a) => Array.from({ length: a.pdf.numPages }, (_, i) => i)));
$('ocr-close').addEventListener('click', hideOcr);
$('ocr-cancel').addEventListener('click', cancelRun);
