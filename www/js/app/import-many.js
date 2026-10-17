// Adds several PDFs to the library without opening them (password-protected ones are skipped).
import { importPath } from './import-path.js';
import { ensureCover } from './ensure-cover.js';
import { closePdf } from '../formats/pdf/close-doc.js';
import { toast } from '../ui/toast.js';
import { t } from '../core/strings.js';
import { emit } from '../core/bus.js';
export async function importMany(paths) {
  let ok = 0, fail = 0;
  for (const p of paths) {
    try {
      const { meta, pdf } = await importPath(p, null);
      await ensureCover(meta, pdf);
      await closePdf(pdf);
      ok++;
    } catch { fail++; }
  }
  emit('libchange');
  const tail = fail ? `, ${t('lib.failed')}: ${fail}` : '';
  toast(`${t('lib.imported')}: ${ok}${tail}`);
}
