// Files / folders dropped on the window: one document opens in the viewer, anything else is imported into the library.
import { expandPaths } from '../io/expand-paths.js';
import { openPath } from './open-path.js';
import { importMany } from './import-many.js';
import { isDocPath } from '../core/format.js';
import { errorText } from './error-text.js';
import { toast } from '../ui/toast.js';
import { t } from '../core/strings.js';
export async function openDropped(paths) {
  try {
    if (paths.length === 1 && isDocPath(paths[0])) { await openPath(paths[0]); return; }
    const files = await expandPaths(paths);
    if (files.length) await importMany(files); else toast(t('lib.noPdf'));
  } catch (e) {
    toast(errorText(e) ?? '');
  }
}
