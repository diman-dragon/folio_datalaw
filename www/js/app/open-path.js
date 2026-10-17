// Opens one PDF from disk in the viewer (adding it to the library on the way).
import { importPath } from './import-path.js';
import { ensureCover } from './ensure-cover.js';
import { errorText } from './error-text.js';
import { openViewer } from '../ui/viewer-screen.js';
import { toast } from '../ui/toast.js';
import { emit } from '../core/bus.js';
let busy = false;
export async function openPath(path) {
  if (busy) return;
  busy = true;
  try {
    const { meta, pdf } = await importPath(path);
    emit('libchange');
    ensureCover(meta, pdf);
    await openViewer(meta, pdf);
  } catch (e) {
    const msg = errorText(e);
    if (msg) toast(msg);
  } finally {
    busy = false;
  }
}
