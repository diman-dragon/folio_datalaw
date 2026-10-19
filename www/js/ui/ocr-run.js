// Runs OCR for a set of pages with a progress bar, error box and cancel; one run at a time.
import { recognizePages } from '../app/ocr.js';
import { stopOcr } from '../io/ocr-engine.js';
import { getActive } from './active-doc.js';
import { getLangs } from './ocr-langs.js';
import { toast } from './toast.js';
import { t } from '../core/strings.js';
const $ = (id) => document.getElementById(id);
let busy = false, stop = false;
export function cancelRun() {
  stop = true;
  stopOcr();
}
// pages(active) -> page indexes; resolves true when the run finished (not cancelled / failed).
export async function runOcr(pages) {
  const a = getActive();
  if (busy || !a) return false;
  busy = true;
  stop = false;
  $('ocr-run').hidden = false;
  $('ocr-error').hidden = true;
  let finished = false;
  try {
    const done = await recognizePages(a, a.meta.id, pages(a), getLangs(), {
      cancelled: () => stop,
      onPage: (i, n, p) => {
        $('ocr-fill').style.width = `${((i - 1 + p) / n) * 100}%`;
        $('ocr-status').textContent = t('ocr.progress').replace('{i}', i).replace('{n}', n).replace('{p}', Math.round(p * 100));
      },
    });
    if (!stop) { toast(t(done ? 'ocr.done' : 'ocr.nothing')); finished = true; }
  } catch (err) {
    const missing = err.message === 'ocr-missing' || err.message === 'ocr-lang';
    $('ocr-error').textContent = missing ? t('ocr.missing') : `${t('ocr.fail')}: ${String(err?.message ?? err).slice(0, 300)}`;
    $('ocr-error').hidden = false;
  }
  busy = false;
  $('ocr-run').hidden = true;
  return finished;
}
