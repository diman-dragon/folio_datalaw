// OCR language chips: which installed languages are on (remembered), painted into the sheet.
import { ocrInfo } from '../io/ocr-engine.js';
import { t } from '../core/strings.js';
import { getPref, setPref } from '../core/prefs.js';
let langs = getPref('ocrlangs', ['eng', 'rus']);
export const getLangs = () => langs;
export async function paintChips(box) {
  const info = await ocrInfo();
  box.replaceChildren(...(info?.langs ?? []).map((code) => {
    const b = Object.assign(document.createElement('button'), { className: `ocr-chip${langs.includes(code) ? ' on' : ''}`, textContent: t(`ocr.lang.${code}`) });
    b.addEventListener('click', () => {
      langs = langs.includes(code) ? langs.filter((x) => x !== code) : [...langs, code];
      if (!langs.length) langs = [code];
      setPref('ocrlangs', langs);
      paintChips(box);
    });
    return b;
  }));
}
