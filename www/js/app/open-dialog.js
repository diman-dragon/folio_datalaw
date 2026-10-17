// "Open" action: native dialog -> open / import the chosen PDFs.
import { pickPdfs } from '../io/pick-pdfs.js';
import { openPaths } from './open-paths.js';
import { toast } from '../ui/toast.js';
import { errorText } from './error-text.js';
export async function openDialog() {
  try {
    const paths = await pickPdfs();
    if (paths.length) await openPaths(paths);
  } catch (e) {
    toast(errorText(e) ?? '');
  }
}
