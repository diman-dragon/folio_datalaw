// "Open folder" action: choose a folder, find every document inside (recursively) and add them to the library.
import { pickFolder } from '../io/pick-folder.js';
import { expandPaths } from '../io/expand-paths.js';
import { importMany } from './import-many.js';
import { errorText } from './error-text.js';
import { toast } from '../ui/toast.js';
import { t } from '../core/strings.js';
export async function openFolder() {
  try {
    const dir = await pickFolder();
    if (!dir) return;
    const files = await expandPaths([dir]);
    if (files.length) await importMany(files); else toast(t('lib.noPdf'));
  } catch (e) {
    toast(errorText(e) ?? '');
  }
}
