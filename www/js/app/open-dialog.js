// "Open" action: native dialog -> open / import the chosen documents.
import { pickDocs } from '../io/pick-docs.js';
import { openPaths } from './open-paths.js';
import { toast } from '../ui/toast.js';
import { errorText } from './error-text.js';
export async function openDialog() {
  try {
    const paths = await pickDocs();
    if (paths.length) await openPaths(paths);
  } catch (e) {
    toast(errorText(e) ?? '');
  }
}
