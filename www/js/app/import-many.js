// Adds many PDFs (a folder, several files) to the library without opening them; shows progress.
import { importPath } from './import-path.js';
import { ensureCover } from './ensure-cover.js';
import { closePdf } from '../formats/pdf/close-doc.js';
import { getDocByPath } from '../data/library.js';
import { toast } from '../ui/toast.js';
import { summary } from './import-summary.js';
import { t } from '../core/strings.js';
import { emit } from '../core/bus.js';
let busy = false;
export async function importMany(paths) {
  if (busy) return;
  busy = true;
  let ok = 0, skipped = 0, fail = 0;
  try {
    for (let n = 0; n < paths.length; n++) {
      toast(`${t('lib.adding')} ${n + 1} / ${paths.length}`, 60000);
      if (getDocByPath(paths[n])) { skipped++; continue; }
      try {
        const { meta, pdf } = await importPath(paths[n], null); // password-protected files are skipped
        await ensureCover(meta, pdf);
        await closePdf(pdf);
        ok++;
      } catch { fail++; }
      if (n % 5 === 4) emit('libchange'); // the library fills up while we work
    }
  } finally {
    busy = false;
  }
  emit('libchange');
  toast(summary(ok, skipped, fail));
}
